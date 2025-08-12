import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// @ts-ignore - We'll handle type properly in the component
import { RouteMap } from '../../components/RouteMap';
import { getCurrentLocation, searchPlaces } from '../../services/locationService';
import { useMilestoneStore } from '../../store/milestoneStore';
import { Milestone, OptimizedRoute, SearchResult } from '../../types/route';
import { optimizeRoute } from '../../utils/routeUtils';

const { width, height } = Dimensions.get('window');

export default function RoutePlannerScreen() {
  const { milestones, addMilestone, removeMilestone, loadStoredMilestones, setMilestones } = useMilestoneStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  const [duration, setDuration] = useState(30);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Route optimization states
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [showOptimizedRoute, setShowOptimizedRoute] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);

  // Route and directions states
  const [routeCoordinates, setRouteCoordinates] = useState<{latitude: number; longitude: number}[]>([]);
  const [alternateRoutes, setAlternateRoutes] = useState<any[]>([]);
  const [showAlternateRoutes, setShowAlternateRoutes] = useState(false);

  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Auto-draw route when milestones change
  useEffect(() => {
    if (milestones.length >= 2) {
      drawRouteBetweenMilestones();
    } else {
      setRouteCoordinates([]);
    }
  }, [milestones]);

  useEffect(() => {
    loadStoredMilestones();
    const getLocation = async () => {
      try {
        const location = await getCurrentLocation();
        if (location) {
          setUserLocation(location);
          setMapRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } else {
          setMapRegion({
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (error) {
        console.error('Location fetch error:', error);
      }
    };
    getLocation();
  }, [loadStoredMilestones]);

  const calculateRegion = (milestones: Milestone[]) => {
    if (milestones.length === 0) return null;
    try {
      const validMilestones = milestones.filter(m => m.coordinates);
      if (validMilestones.length === 0) return null;
      const lats = validMilestones.map(m => m.coordinates.latitude);
      const lngs = validMilestones.map(m => m.coordinates.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const deltaLat = Math.max(maxLat - minLat, 0.02);
      const deltaLng = Math.max(maxLng - minLng, 0.02);
      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: deltaLat * 1.5,
        longitudeDelta: deltaLng * 1.5,
      };
    } catch (error) {
      console.error('Error calculating region:', error);
      return null;
    }
  };

  const refreshLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setUserLocation(location);
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      Alert.alert('Location Updated', `Current location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
    } else {
      Alert.alert('Location Error', 'Unable to get current location. Please check location permissions.');
    }
  };

  const drawRouteBetweenMilestones = async () => {
    if (milestones.length < 2) return;
    try {
      const coordinates: {latitude: number; longitude: number}[] = [];
      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        if (milestone.coordinates) {
          coordinates.push({
            latitude: milestone.coordinates.latitude,
            longitude: milestone.coordinates.longitude
          });
        }
      }
      setRouteCoordinates(coordinates);
      const region = calculateRegion(milestones);
      if (region) {
        setMapRegion(region);
      }
    } catch (error) {
      console.error('Route drawing failed:', error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      // LocationIQ searchPlaces implementation uses your token
      const places = await searchPlaces(searchQuery, userLocation || undefined);
      const formattedPlaces: SearchResult[] = places.map((place, index) => ({
        id: place.id || `search_${index}`,
        name: place.name,
        address: place.address,
        coordinates: place.coordinates
      }));
      setSearchResults(formattedPlaces);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place: SearchResult) => {
    setSelectedPlace(place);
    setSearchResults([]);
    setSearchQuery('');
    if (milestones.length < 2) {
      handleAddToRoute(place);
    }
  };

  const handleAddToRoute = (place?: SearchResult) => {
    const placeToAdd = place || selectedPlace;
    if (!placeToAdd) return;
    const newMilestone: Milestone = {
      id: `milestone_${Date.now()}`,
      name: placeToAdd.name,
      address: placeToAdd.address,
      coordinates: {
        latitude: placeToAdd.coordinates.latitude,
        longitude: placeToAdd.coordinates.longitude,
      },
      estimatedDuration: duration,
      order: milestones.length,
      completed: false,
    };
    addMilestone(newMilestone);
    setSelectedPlace(null);
    setSearchQuery('');
    setMapRegion({
      latitude: placeToAdd.coordinates.latitude,
      longitude: placeToAdd.coordinates.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    Alert.alert('Added to Route!', `${placeToAdd.name} has been added to your route.`);
  };

  const handleRemoveFromRoute = (milestoneId: string) => {
    removeMilestone(milestoneId);
    setOptimizedRoute(null);
    setShowOptimizedRoute(false);
    setRouteCoordinates([]);
  };

  const handleShowAlternateRoutes = async () => {
    if (milestones.length < 2) {
      Alert.alert('Alternate Routes', 'Please add at least 2 destinations to see alternate routes.');
      return;
    }
    try {
      const routes = [];
      for (let i = 0; i < Math.min(milestones.length, 3); i++) {
        const shuffledMilestones = [...milestones];
        if (i > 0) {
          shuffledMilestones.reverse();
        }
        if (userLocation) {
          const alternateRoute = optimizeRoute(shuffledMilestones, userLocation);
          routes.push({
            id: `route_${i}`,
            name: `Route ${i + 1}`,
            route: alternateRoute,
            description: i === 0 ? 'Shortest Distance' : `Alternative ${i}`
          });
        }
      }
      setAlternateRoutes(routes);
      setShowAlternateRoutes(true);
      Alert.alert(
        'Alternate Routes Available',
        `Found ${routes.length} different route options. Choose the one that suits you best.`
      );
    } catch (error) {
      console.error('Alternate routes error:', error);
      Alert.alert('Error', 'Failed to generate alternate routes. Please try again.');
    }
  };

  const handleOptimizeRoute = () => {
    if (milestones.length < 2) {
      Alert.alert('Route Optimization', 'Please add at least 2 destinations to optimize the route.');
      return;
    }
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services to optimize the route.');
      return;
    }
    try {
      const result = optimizeRoute(milestones, userLocation);
      setOptimizedRoute(result);
      setShowOptimizedRoute(true);
      const region = calculateRegion(result.milestones);
      if (region) {
        setMapRegion(region);
      }
      Alert.alert(
        'Route Optimized!',
        `Total Distance: ${result.totalDistance.toFixed(1)} km\nEstimated Time: ${Math.round(result.estimatedTotalTime / 60)}h ${result.estimatedTotalTime % 60}m\n\nRoute has been optimized for shortest distance.`
      );
    } catch (error) {
      console.error('Route optimization error:', error);
      Alert.alert('Optimization Error', 'Failed to optimize the route. Please try again.');
    }
  };

  const handleStartNavigation = () => {
    if (!optimizedRoute) return;
    setIsNavigating(true);
    setCurrentMilestoneIndex(0);
    Alert.alert('Navigation Started!', 'Follow the optimized route to complete your micro adventure.');
  };

  const handleNextMilestone = () => {
    if (!optimizedRoute || currentMilestoneIndex >= optimizedRoute.milestones.length - 1) return;
    const nextIndex = currentMilestoneIndex + 1;
    setCurrentMilestoneIndex(nextIndex);
    if (nextIndex >= optimizedRoute.milestones.length - 1) {
      Alert.alert('Adventure Complete!', 'Congratulations! You have completed your micro adventure route.');
      setIsNavigating(false);
    } else {
      Alert.alert('Next Destination', `Navigate to: ${optimizedRoute.milestones[nextIndex].name}`);
    }
  };

  const getRouteCoordinates = () => {
    if (!showOptimizedRoute || !optimizedRoute) return [];
    return optimizedRoute.milestones
      .filter(milestone => milestone.coordinates &&
        !isNaN(milestone.coordinates.latitude) &&
        !isNaN(milestone.coordinates.longitude))
      .map(milestone => ({
        latitude: milestone.coordinates.latitude,
        longitude: milestone.coordinates.longitude,
      }));
  };

  const getRouteDetails = () => {
    if (!optimizedRoute) return [];
    const details = [];
    for (let i = 0; i < optimizedRoute.milestones.length - 1; i++) {
      const from = optimizedRoute.milestones[i];
      const to = optimizedRoute.milestones[i + 1];
      if (!from.coordinates || !to.coordinates) continue;
      const R = 6371; // Earth's radius in km
      const dLat = (to.coordinates.latitude - from.coordinates.latitude) * Math.PI / 180;
      const dLon = (to.coordinates.longitude - from.coordinates.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(from.coordinates.latitude * Math.PI / 180) * Math.cos(to.coordinates.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      details.push({
        from: from.name,
        to: to.name,
        distance: distance.toFixed(1),
        time: Math.round(distance * 2) // Rough estimate: 2 minutes per km
      });
    }
    return details;
  };

  // Get current milestone ID based on navigation state
  const getCurrentMilestoneId = () => {
    if (isNavigating && milestones.length > currentMilestoneIndex) {
      return milestones[currentMilestoneIndex].id;
    }
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Micro Adventure Route Planner</Text>
        <Text style={styles.subtitle}>Plan your local adventure route</Text>
      </View>

      {/* Map Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Route Map</Text>
        <View style={styles.map}>
          <RouteMap 
            milestones={showOptimizedRoute && optimizedRoute ? optimizedRoute.milestones : milestones} 
            currentMilestoneId={getCurrentMilestoneId()} 
          />
        </View>
        {/* Location info display */}
        {userLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              📍 Current Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={refreshLocation}
          >
            <Text style={styles.addButtonText}>📍 Refresh My Location</Text>
          </TouchableOpacity>
          {milestones.length >= 2 && (
            <TouchableOpacity
              style={styles.optimizeButton}
              onPress={handleShowAlternateRoutes}
            >
              <Text style={styles.optimizeButtonText}>Show Alternate Routes</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Destinations</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Type to search places..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {isSearching && (
            <View style={styles.searchButton}>
              <ActivityIndicator color="#007AFF" size="small" />
            </View>
          )}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.resultItem, selectedPlace?.id === item.id && styles.resultItemSelected]}
                onPress={() => handleSelectPlace(item)}
              >
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultAddress}>{item.address}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Place */}
        {selectedPlace && (
          <View style={styles.selectedPlace}>
            <Text style={styles.selectedPlaceName}>{selectedPlace.name}</Text>
            <Text style={styles.selectedPlaceAddress}>{selectedPlace.address}</Text>
            
            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>Estimated time to spend (minutes):</Text>
              <TextInput
                style={styles.durationInput}
                value={duration.toString()}
                onChangeText={(text) => setDuration(parseInt(text) || 30)}
                keyboardType="numeric"
              />
            </View>
            
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddToRoute()}>
              <Text style={styles.addButtonText}>Add to Route</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Alternate Routes Display */}
      {showAlternateRoutes && alternateRoutes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alternate Routes</Text>
          {alternateRoutes.map((route, index) => (
            <View key={route.id} style={styles.routeDetailItem}>
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneName}>{route.name} - {route.description}</Text>
                <Text style={styles.milestoneAddress}>
                  Distance: {route.route.totalDistance.toFixed(1)} km
                </Text>
                <Text style={styles.milestoneDuration}>
                  Time: {Math.round(route.route.estimatedTotalTime / 60)}h {route.route.estimatedTotalTime % 60}m
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setOptimizedRoute(route.route);
                  setShowOptimizedRoute(true);
                  setShowAlternateRoutes(false);
                }}
              >
                <Text style={styles.addButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setShowAlternateRoutes(false)}
          >
            <Text style={styles.removeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Current Route */}
      {milestones.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Route ({milestones.length} destinations)</Text>
          {milestones.map((milestone, index) => (
            <View key={milestone.id} style={styles.milestoneItem}>
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneName}>{index + 1}. {milestone.name}</Text>
                <Text style={styles.milestoneAddress}>{milestone.address}</Text>
                <Text style={styles.milestoneDuration}>{milestone.estimatedDuration} minutes</Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFromRoute(milestone.id)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeRoute}>
            <Text style={styles.optimizeButtonText}>Optimize Route</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Optimized Route Details */}
      {optimizedRoute && showOptimizedRoute && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optimized Route</Text>
          
          <View style={styles.routeStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Distance</Text>
              <Text style={styles.statValue}>{optimizedRoute.totalDistance.toFixed(1)} km</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Estimated Time</Text>
              <Text style={styles.statValue}>{Math.round(optimizedRoute.estimatedTotalTime / 60)}h {optimizedRoute.estimatedTotalTime % 60}m</Text>
            </View>
          </View>

          <View style={styles.routeDetails}>
            {getRouteDetails().map((detail, index) => (
              <View key={index} style={styles.routeDetailItem}>
                <Text style={styles.routeDetailText}>
                  {detail.from} → {detail.to}
                </Text>
                <Text style={styles.routeDetailStats}>
                  {detail.distance} km • {detail.time} min
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.startNavigationButton} onPress={handleStartNavigation}>
            <Text style={styles.startNavigationButtonText}>Start Navigation</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation Controls */}
      {isNavigating && optimizedRoute && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          <View style={styles.navigationInfo}>
            <Text style={styles.currentMilestone}>
              Current: {optimizedRoute.milestones[currentMilestoneIndex]?.name}
            </Text>
            {currentMilestoneIndex < optimizedRoute.milestones.length - 1 && (
              <Text style={styles.nextMilestone}>
                Next: {optimizedRoute.milestones[currentMilestoneIndex + 1]?.name}
              </Text>
            )}
            <Text style={styles.progress}>
              Progress: {currentMilestoneIndex + 1} / {optimizedRoute.milestones.length}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNextMilestone}>
            <Text style={styles.nextButtonText}>
              {currentMilestoneIndex >= optimizedRoute.milestones.length - 1 ? 'Complete Adventure' : 'Next Destination'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  mapPlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: '#666',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchResults: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedPlace: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectedPlaceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectedPlaceAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  durationLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 10,
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  milestoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  milestoneAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  milestoneDuration: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  optimizeButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  optimizeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  routeDetails: {
    marginBottom: 20,
  },
  routeDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 5,
  },
  routeDetailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  routeDetailStats: {
    fontSize: 12,
    color: '#666',
  },
  startNavigationButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  startNavigationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navigationInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  currentMilestone: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 5,
  },
  nextMilestone: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  progress: {
    fontSize: 12,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationInfo: {
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    padding: 8,
    borderRadius: 5,
    margin: 5,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  userLocationMarker: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  milestoneMarker: {
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

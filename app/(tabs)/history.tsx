import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { RouteMap } from '../../components/RouteMap';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getSavedRoutes, removeSavedRoute } from '../../services/storageService';
import { SavedRoute, useRouteStore } from '../../store/routeStore';

export default function HistoryScreen() {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SavedRoute | null>(null);
  const router = useRouter();
  const { loadSavedRoute } = useRouteStore();

  useEffect(() => {
    loadSavedRoutes();
  }, []);

  const loadSavedRoutes = async () => {
    try {
      const routes = await getSavedRoutes();
      setSavedRoutes(routes || []);
    } catch (error) {
      console.error('Failed to load saved routes:', error);
      Alert.alert('Error', 'Failed to load saved routes');
    }
  };

  const handleSelectRoute = (route: SavedRoute) => {
    setSelectedRoute(route);
  };

  const handleLoadRoute = () => {
    if (selectedRoute) {
      loadSavedRoute(selectedRoute.id);
      router.push('/');
      Alert.alert('Success', `Loaded route: ${selectedRoute.name || 'Unnamed Route'}`);
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    Alert.alert(
      'Delete Route',
      'Are you sure you want to delete this route?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeSavedRoute(routeId);
              loadSavedRoutes();
              if (selectedRoute && selectedRoute.id === routeId) {
                setSelectedRoute(null);
              }
            } catch (error) {
              console.error('Failed to delete route:', error);
              Alert.alert('Error', 'Failed to delete route');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderRouteItem = ({ item }: { item: SavedRoute }) => (
    <TouchableOpacity
      style={[
        styles.routeItem,
        selectedRoute && selectedRoute.id === item.id ? styles.selectedRouteItem : null,
      ]}
      onPress={() => handleSelectRoute(item)}
    >
      <View style={styles.routeItemContent}>
        <ThemedText style={styles.routeName}>
          {item.name || 'Unnamed Route'}
        </ThemedText>
        <ThemedText style={styles.routeDate}>
          {formatDate(item.timestamp)}
        </ThemedText>
        <ThemedText style={styles.routeInfo}>
          Milestones: {item.milestones?.length || 0}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteRoute(item.id)}
      >
        <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="default" />
        <ThemedText type="title" style={styles.title}>
          Saved Routes
        </ThemedText>
        
        {savedRoutes.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No saved routes yet. Plan a route and save it to see it here.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={savedRoutes}
            keyExtractor={(item) => item.id}
            renderItem={renderRouteItem}
            contentContainerStyle={styles.listContainer}
          />
        )}

        {selectedRoute && (
          <View style={styles.detailsContainer}>
            <ThemedText type="subtitle">Route Details</ThemedText>
            
            <View style={styles.mapContainer}>
              <RouteMap
                milestones={selectedRoute.milestones || []}
                currentMilestoneId={null}
              />
            </View>
            
            <View style={styles.detailsInfo}>
              <ThemedText style={styles.detailName}>
                {selectedRoute.name || 'Unnamed Route'}
              </ThemedText>
              <ThemedText style={styles.detailDate}>
                Created: {formatDate(selectedRoute.timestamp)}
              </ThemedText>
              <ThemedText style={styles.detailDescription}>
                {selectedRoute.milestones?.length || 0} milestones
                {selectedRoute.distance ? ` • ${selectedRoute.distance.toFixed(1)} km` : ''}
                {selectedRoute.duration ? ` • ${selectedRoute.duration.toFixed(0)} min` : ''}
              </ThemedText>
            </View>
            
            <TouchableOpacity
              style={styles.loadButton}
              onPress={handleLoadRoute}
            >
              <ThemedText style={styles.loadButtonText}>
                Load Route
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  routeItemContent: {
    flex: 1,
  },
  selectedRouteItem: {
    backgroundColor: '#e3f2fd',
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeDate: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  routeInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  detailsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  mapContainer: {
    height: 200,
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailsInfo: {
    marginBottom: 16,
  },
  detailName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailDate: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  detailDescription: {
    fontSize: 14,
  },
  loadButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
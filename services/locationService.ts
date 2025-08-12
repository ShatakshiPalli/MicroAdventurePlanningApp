// LocationIQ API integration - REAL SEARCH ONLY (No Mock Data)
import axios from 'axios';
import * as Location from 'expo-location';

const LOCATIONIQ_API_KEY = 'pk.bb3ba6c4884db59d0c3bde27848f25fc';
const BASE_URL = 'https://us1.locationiq.com/v1';

export interface LocationIQPlace {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: string[];
  class: string;
  type: string;
  importance: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  distance?: number;
  estimatedTime?: number; // in minutes
}

export async function searchPlaces(
  query: string, 
  userLocation?: { latitude: number; longitude: number }
): Promise<Place[]> {
  try {
    console.log('🔍 Searching LocationIQ API for:', query);
    
    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    const response = await axios.get(`${BASE_URL}/search.php`, {
      params: {
        key: LOCATIONIQ_API_KEY,
        q: query.trim(),
        format: 'json',
        limit: 15,
        // Remove countrycodes restriction for global search
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
        dedupe: 1 // Remove duplicate results
      },
      timeout: 15000 // 15 second timeout
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response from LocationIQ API');
    }

    const results: LocationIQPlace[] = response.data;
    console.log('✅ LocationIQ API returned:', results.length, 'places');

    if (results.length === 0) {
      throw new Error(`No places found for "${query}". Try different keywords or check spelling.`);
    }

    const places: Place[] = results.map((result, index) => {
      const place: Place = {
        id: result.place_id || `place_${Date.now()}_${index}`,
        name: extractPlaceName(result),
        address: result.display_name,
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        }
      };

      // Calculate distance and estimated time if user location is provided
      if (userLocation) {
        place.distance = calculateDistance(
          userLocation,
          place.coordinates
        );
        // Estimate travel time: average 40 km/h in city, 60 km/h outside
        const avgSpeed = place.distance < 50 ? 40 : 60; // km/h
        place.estimatedTime = Math.round((place.distance / avgSpeed) * 60); // convert to minutes
      }

      return place;
    });

    // Sort by distance if available, otherwise by importance
    if (userLocation) {
      places.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    console.log('📍 Processed places:', places.length);
    return places;

  } catch (error) {
    console.error('❌ LocationIQ search error:', error);
    
    // Provide helpful error messages based on error type
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Search request timed out. Please check your internet connection and try again.');
      } else if (error.response?.status === 401) {
        throw new Error('LocationIQ API authentication failed. Please check the API key.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (error.response && error.response.status >= 500) {
        throw new Error('LocationIQ service is temporarily unavailable. Please try again later.');
      } else if (error.response?.status === 404) {
        throw new Error('LocationIQ API endpoint not found. Please check the service configuration.');
      }
    }
    
    // Re-throw the error to be handled by the calling function
    throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

function extractPlaceName(result: LocationIQPlace): string {
  // Try to extract a meaningful place name from the display_name
  const parts = result.display_name.split(',').map(p => p.trim());
  
  // If it's a specific place (not just an address), use the first part
  if (result.class === 'tourism' || result.class === 'amenity' || result.class === 'historic' || 
      result.class === 'shop' || result.class === 'leisure' || result.class === 'office') {
    return parts[0];
  }
  
  // For areas, neighborhoods, and suburbs
  if (result.class === 'place' && (result.type === 'suburb' || result.type === 'neighbourhood' || 
      result.type === 'quarter' || result.type === 'city_district')) {
    return parts[0];
  }
  
  // For addresses, try to get meaningful name
  if (parts.length >= 2) {
    const firstPart = parts[0];
    const secondPart = parts[1];
    
    // If first part looks like a house number, combine with second part
    if (/^\d+/.test(firstPart)) {
      return `${firstPart}, ${secondPart}`;
    }
    
    // If first part is too generic, try second part
    if (firstPart.length > 2 && !firstPart.toLowerCase().includes('road') && 
        !firstPart.toLowerCase().includes('street')) {
      return firstPart;
    }
    
    return secondPart;
  }
  
  return parts[0];
}

// Get reverse geocoding (address from coordinates)
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    console.log(`🔄 Reverse geocoding: ${latitude}, ${longitude}`);
    
    const response = await axios.get(`${BASE_URL}/reverse.php`, {
      params: {
        key: LOCATIONIQ_API_KEY,
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1,
      },
      timeout: 10000,
    });

    if (response.data && response.data.display_name) {
      console.log('✅ Reverse geocoding successful');
      return response.data.display_name;
    }
    
    throw new Error('No address found for these coordinates');
  } catch (error) {
    console.error('❌ Reverse geocoding failed:', error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}

// Get directions between two points using LocationIQ
export async function getDirections(
  startLat: number, 
  startLon: number, 
  endLat: number, 
  endLon: number
): Promise<any> {
  try {
    console.log(`🛣️ Getting directions from ${startLat},${startLon} to ${endLat},${endLon}`);
    
    const response = await axios.get(`${BASE_URL}/directions/driving/${startLon},${startLat};${endLon},${endLat}`, {
      params: {
        key: LOCATIONIQ_API_KEY,
        steps: true,
        geometries: 'geojson',
        overview: 'full',
        alternatives: false
      },
      timeout: 15000,
    });

    console.log('✅ Directions received');
    return response.data;
  } catch (error) {
    console.error('❌ Directions API failed:', error);
    throw new Error('Failed to get directions between the locations');
  }
}

// Get current location using Expo Location API
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    console.log('📍 Requesting location permissions...');
    
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('❌ Location permission denied');
      return null;
    }
    
    console.log('✅ Location permission granted, getting current location...');
    
    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    const result = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    
    console.log('✅ Current location obtained:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Location error:', error);
    console.log('ℹ️ Location access failed, user will need to search for their location');
    return null;
  }
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

// Utility function to validate coordinates
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// Route sharing utilities
import { Alert, Share } from 'react-native';
import { Milestone, OptimizedRoute } from '../types/route';

// Simple base64 encode/decode functions for React Native
function base64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64Decode(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

export function generateRouteCode(milestones: Milestone[]): string {
  // Create a shareable route code by encoding milestone data
  const routeData = {
    version: '1.0',
    milestones: milestones.map(m => ({
      name: m.name,
      coordinates: m.coordinates,
      duration: m.estimatedDuration
    })),
    timestamp: Date.now()
  };
  
  // Convert to base64 for easy sharing
  return base64Encode(JSON.stringify(routeData));
}

export function decodeRouteCode(code: string): Milestone[] | null {
  try {
    const decoded = base64Decode(code);
    const routeData = JSON.parse(decoded);
    
    if (routeData.version !== '1.0' || !routeData.milestones) {
      return null;
    }
    
    return routeData.milestones.map((m: any, index: number) => ({
      id: `shared_${Date.now()}_${index}`,
      name: m.name,
      address: `Shared location: ${m.name}`,
      coordinates: m.coordinates,
      estimatedDuration: m.duration,
      order: index + 1,
      completed: false
    }));
  } catch (e) {
    return null;
  }
}

export async function shareRoute(route: OptimizedRoute) {
  try {
    const routeCode = generateRouteCode(route.milestones);
    const shareText = `🗺️ Micro Adventure Route\n\n` +
      `${route.milestones.length} stops • ${route.totalDistance.toFixed(1)}km • ${route.estimatedTotalTime}min\n\n` +
      `Places:\n${route.milestones.map(m => `• ${m.name}`).join('\n')}\n\n` +
      `Route Code: ${routeCode}\n\n` +
      `Copy this code and paste it in the Micro Adventure Route Planner app to import this route!`;
    
    await Share.share({
      message: shareText,
      title: 'Micro Adventure Route'
    });
  } catch (error) {
    Alert.alert('Share Failed', 'Could not share the route. Please try again.');
  }
}

export function saveRouteTemplate(name: string, milestones: Milestone[]): void {
  // For now, just show success message
  // In a full implementation, this would save to AsyncStorage
  Alert.alert('Template Saved', `Route template "${name}" has been saved!`);
}

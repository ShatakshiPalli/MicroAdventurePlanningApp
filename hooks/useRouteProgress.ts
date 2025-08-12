// Real-time navigation and progress tracking using geolocation
import * as Location from 'expo-location';
import { useEffect } from 'react';
import { useMilestoneStore } from '../store/milestoneStore';
import { Milestone } from '../types/route';

export function useRouteProgress(routeMilestones: Milestone[], radius: number = 75) {
  const { updateMilestone } = useMilestoneStore();

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
        (position) => {
          const { latitude, longitude } = position.coords;
          routeMilestones.forEach(milestone => {
            if (!milestone.completed && isWithinRadius(latitude, longitude, milestone.coordinates, radius)) {
              updateMilestone({ ...milestone, completed: true });
              // Notification removed - not supported in Expo Go
              console.log(`You've reached ${milestone.name}! Enjoy exploring.`);
            }
          });
        }
      );
    }
    startTracking();
    return () => {
      if (subscription) subscription.remove();
    };
  }, [routeMilestones]);
}

function isWithinRadius(lat: number, lon: number, coords: { latitude: number; longitude: number }, radius: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(coords.latitude - lat);
  const dLon = toRad(coords.longitude - lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat)) * Math.cos(toRad(coords.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c < radius;
}

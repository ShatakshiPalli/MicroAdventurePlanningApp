// Persistence using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedRoute } from '../store/routeStore';
import { Milestone } from '../types/route';

const MILESTONES_KEY = 'micro_adventure_milestones';
const ROUTES_KEY = 'micro_adventure_routes';

export async function saveMilestones(milestones: Milestone[]) {
  try {
    await AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones));
  } catch (e) {
    // Handle error
  }
}

export async function loadMilestones(): Promise<Milestone[]> {
  try {
    const data = await AsyncStorage.getItem(MILESTONES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Routes persistence functions
export async function loadRoutes(): Promise<SavedRoute[]> {
  try {
    const data = await AsyncStorage.getItem(ROUTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load routes:', e);
    return [];
  }
}

export async function saveRoute(route: SavedRoute): Promise<void> {
  try {
    const routes = await loadRoutes();
    routes.unshift(route); // Add new route to the beginning
    await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
  } catch (e) {
    console.error('Failed to save route:', e);
    throw e;
  }
}

export async function deleteRoute(routeId: string): Promise<void> {
  try {
    const routes = await loadRoutes();
    const updatedRoutes = routes.filter(route => route.id !== routeId);
    await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(updatedRoutes));
  } catch (e) {
    console.error('Failed to delete route:', e);
    throw e;
  }
}

// Aliases for the history screen
export const getSavedRoutes = loadRoutes;
export const removeSavedRoute = deleteRoute;

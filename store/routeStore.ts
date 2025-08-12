import { create } from 'zustand';
import { loadRoutes, saveRoute } from '../services/storageService';
import { Milestone } from '../types/route';

export interface SavedRoute {
  id: string;
  name: string;
  milestones: Milestone[];
  timestamp: number;
  distance?: number;
  duration?: number;
}

interface RouteState {
  milestones: Milestone[];
  optimized: boolean;
  tracking: boolean;
  currentMilestoneId: string | null;
  loadingOptimization: boolean;
  loadSavedRoute: (routeId: string) => Promise<void>;
  optimize: (userLocation?: {latitude: number; longitude: number}) => Promise<void>;
  saveCurrent: (name?: string) => Promise<void>;
  setTracking: (tracking: boolean) => void;
  generateAlternatives: () => void;
  exportRoute: () => string | null;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  milestones: [],
  optimized: false,
  tracking: false,
  currentMilestoneId: null,
  loadingOptimization: false,

  loadSavedRoute: async (routeId: string) => {
    try {
      const routes = await loadRoutes();
      const route = routes.find(r => r.id === routeId);
      if (route) {
        set({ 
          milestones: route.milestones,
          optimized: true,
          currentMilestoneId: null
        });
      }
    } catch (error) {
      console.error('Failed to load route:', error);
    }
  },

  optimize: async (userLocation?: {latitude: number; longitude: number}) => {
    const { milestones } = get();
    
    set({ loadingOptimization: true });
    
    try {
      // Simple optimization - just set optimized flag for now
      // In a real app, you would call an API to optimize the route
      setTimeout(() => {
        set({ 
          optimized: true,
          loadingOptimization: false
        });
      }, 1000);
    } catch (error) {
      console.error('Optimization error:', error);
      set({ loadingOptimization: false });
    }
  },

  saveCurrent: async (name?: string) => {
    const { milestones } = get();
    if (milestones.length === 0) return;

    const newRoute: SavedRoute = {
      id: `route_${Date.now()}`,
      name: name || `Route ${new Date().toLocaleDateString()}`,
      milestones: [...milestones],
      timestamp: Date.now(),
      // Add distance and duration if available in your app
    };

    try {
      await saveRoute(newRoute);
    } catch (error) {
      console.error('Failed to save route:', error);
    }
  },

  setTracking: (tracking: boolean) => {
    set({ tracking });
  },

  generateAlternatives: () => {
    // This would generate alternative routes in a real app
    console.log('Generating alternatives...');
  },

  exportRoute: () => {
    const { milestones } = get();
    if (milestones.length === 0) return null;
    
    // Simple export as JSON string
    return JSON.stringify({
      milestones,
      timestamp: Date.now()
    });
  }
}));

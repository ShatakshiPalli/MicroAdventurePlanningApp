// TypeScript interfaces for milestones and routes
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  display_name: string;
  lat: string;
  lon: string;
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
}
// ...existing code...
export interface Milestone {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  estimatedDuration: number; // in minutes
  order: number;
  completed: boolean;
}
// ...existing code...
export interface RouteSegment {
  from: Milestone;
  to: Milestone;
  distance: number;
}

export interface OptimizedRoute {
  milestones: Milestone[];
  totalDistance: number;
  estimatedTotalTime: number;
  startingPoint: Milestone | null;
  routeSegments: RouteSegment[];
}

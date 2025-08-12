# Micro Adventure Route Planner

## Overview
Micro-Adventure Route Planner is a React Native application built with TypeScript and Expo that helps users plan local micro-adventures. It allows creating milestone-based routes, optimizing travel paths, and navigating in real-time with timeline tracking. The app leverages native device APIs for location, notifications, and offline capabilities.

## Features
-  Location search with places autocomplete
-  Milestone management (add, remove, reorder, set visit time: 15min-2hr)
-  Route optimization (TSP algorithm: Nearest Neighbor + Haversine formula)
-  Interactive timeline (horizontal, progress tracking, completion status)
-  Map visualization (route lines, custom markers, real-time position)
-  Real-time navigation (background location tracking, proximity detection)
-  Push notifications (milestone arrival, route completion)
-  Offline support (AsyncStorage for milestone persistence)
-  TypeScript throughout for type safety

## Tech Stack
- **React Native** (Expo ~53.0)
- **TypeScript** (full type safety)
- **Zustand** (lightweight state management)
- **Native APIs**: expo-location, AsyncStorage, expo-notifications
- **Map Integration**: expo-maps (compatible with Expo Go)
- **Places Search**: LocationIQ API for location services

## Setup & Run Instructions

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MicroAdventurePlanningApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Scan the QR code with Expo Go app to run on your device

## Places Search Implementation

### Using LocationIQ API
The app uses LocationIQ API for location services with the API key: bb3ba6c4884db59d0c3bde27848f25fc

**Search Examples:**
- City names
- Landmarks
- Street addresses
- Points of interest

## Architecture & Design Decisions
- **Modular structure**: screens, components, utils, types, services, store
- **State management**: Zustand for milestones and app state ([`store/milestoneStore.ts`](store/milestoneStore.ts))
- **Route optimization**: utils/routeUtils.ts implements TSP (Nearest Neighbor)
- **Timeline and map**: Interactive, real-time updates with MapLibre integration
- **Native APIs**: Used for geolocation, notifications, offline storage
- **Settings management**: User preferences and profile stored in AsyncStorage

## Technical Documentation
### Route Optimization Example
```ts
const optimizeRoute = (milestones: Milestone[], currentLocation: Coordinates): OptimizedRoute => {
   const distances = calculateDistanceMatrix(milestones, currentLocation);
   const optimizedOrder = nearestNeighborTSP(distances);
   return {
      milestones: reorderMilestones(milestones, optimizedOrder),
      totalDistance: calculateTotalDistance(optimizedOrder, distances),
      estimatedTotalTime: calculateTotalTime(milestones, optimizedOrder),
      startingPoint: determineStartingPoint(currentLocation, milestones),
      routeSegments: generateRouteSegments(optimizedOrder, milestones, distances),
   };
};
```

### Real-time Progress Tracking
The app tracks user location and updates progress as milestones are reached, providing notifications and visual feedback through the map interface.

## Known Limitations / Assumptions
- Route validation is basic (walkability checks limited)
- Offline map tiles not implemented
- LocationIQ API key required for location search

## Data Structure
- **Milestones**: [`types/route.ts`](types/route.ts) defines the milestone structure with coordinates, duration, and completion status
- **Routes**: Optimized paths between milestones with total distance and time calculations
- **Settings**: User preferences for units, notifications, and default durations

## App Sections
- **Route Planner**: Main screen for planning and optimizing routes
- **History**: View past adventures and saved routes
- **Settings**: Configure app preferences and manage user profile

## Contact
For feedback, suggestions, or inquiries, please contact the development team at [pallishatakshi@gmail.com](mailto:pallishatakshi@gmail.com). We welcome your input to improve the Micro-Adventure Route Planner app!
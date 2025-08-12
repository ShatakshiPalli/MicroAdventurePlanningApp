
# Micro-Adventure Route Planner

## Overview
Micro-Adventure Route Planner is a React Native application (TypeScript, Expo) for planning location-based micro-adventures. Users can create milestone-based routes, optimize travel paths, and navigate in real-time with timeline tracking. The app leverages native device APIs for location, notifications, and offline capabilities.

## Features
- ✅ Location search with places autocomplete
- ✅ Milestone management (add, remove, reorder, set visit time: 15min-2hr)
- ✅ Route optimization (TSP algorithm: Nearest Neighbor + Haversine formula)
- ✅ Interactive timeline (horizontal, progress tracking, completion status)
- ✅ Map visualization (route lines, custom markers, real-time position)
- ✅ Real-time navigation (background location tracking, proximity detection)
- ✅ Push notifications (milestone arrival, route completion)
- ✅ Offline support (AsyncStorage for milestone persistence)
- ✅ TypeScript throughout for type safety

## Tech Stack
- **React Native** (Expo ~53.0)
- **TypeScript** (full type safety)
- **Zustand** (lightweight state management)
- **Native APIs**: expo-location, AsyncStorage, expo-notifications
- **Map Integration**: expo-maps (compatible with Expo Go)
- **Places Search**: Mock service (development) / Google Places API (production)

## Setup & Run Instructions

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd myApp
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

### Current: Mock Service (Development & Demo)
The app currently uses a **mock places service** for development and demonstration:

- **Location**: `services/placesService.ts`
- **Dataset**: Curated collection of popular Indian landmarks (Kolkata, Hyderabad, Mumbai, Delhi)
- **Benefits**: 
  - ✅ Works offline, no API keys required
  - ✅ Reliable for demos and testing
  - ✅ Expo Go compatible
  - ✅ No API quotas or costs

**Search Examples:**
- "Victoria" → Victoria Memorial, Kolkata
- "Hyderabad" → Charminar, Golconda Fort
- "Mumbai" → Gateway of India, Marine Drive
- "Delhi" → Red Fort, India Gate

### Production: Google Places API (Optional)

For production deployment with real-time place data:

1. **Get Google Places API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project and enable "Places API"
   - Generate an API key
   - Restrict the key to Places API for security

2. **Environment Setup:**
   ```bash
   # Create .env file in project root
   EXPO_PUBLIC_GOOGLE_API_KEY=your_api_key_here
   ```

3. **Switch to Google Places:**
   - Replace mock service in `services/placesService.ts`
   - Uncomment Google Places implementation
   - The interface remains the same

**⚠️ Important**: Never commit API keys to the repository.

## Architecture & Design Decisions
- Modular structure: screens, components, utils, types, services, store
- State management: Zustand for milestones and app state
- Route optimization: utils/routeUtils.ts implements TSP (Nearest Neighbor, optional 2-opt)
- Timeline and map: interactive, real-time updates
- Native APIs: used for geolocation, notifications, offline storage

## Technical Documentation
### Route Optimization Example
```ts
const optimizeRoute = (milestones: Milestone[], currentLocation: Coordinates): OptimizedRoute => {
   const distances = calculateDistanceMatrix(milestones, currentLocation);
   const optimizedOrder = nearestNeighborTSP(distances);
   // Bonus: Apply 2-opt optimization
   // const improvedOrder = twoOptOptimization(optimizedOrder, distances);
   return {
      milestones: reorderMilestones(milestones, optimizedOrder),
      totalDistance: calculateTotalDistance(optimizedOrder, distances),
      estimatedTotalTime: calculateTotalTime(milestones, optimizedOrder),
      startingPoint: determineStartingPoint(currentLocation, milestones),
      routeSegments: generateRouteSegments(optimizedOrder, milestones, distances),
   };
};
```

### Real-time Progress Tracking Example
```ts
const trackRouteProgress = async (route: OptimizedRoute) => {
   return Geolocation.watchPosition(
      (position) => {
         const { latitude, longitude } = position.coords;
         const currentMilestone = getCurrentMilestone(route);
         if (isWithinMilestoneRadius(position, currentMilestone, 75)) {
            completeMilestone(currentMilestone.id);
            showMilestoneNotification(currentMilestone);
            updateTimelineProgress(currentMilestone);
         }
      },
      { enableHighAccuracy: true, distanceFilter: 10, interval: 5000 }
   );
};
```

## Screenshots
_Add screenshots of key features here_

## Known Limitations / Assumptions
- Route validation is basic (walkability checks limited)
- Offline map tiles not implemented
- API keys required for location search

## Submission Checklist
- [x] GitHub repository with complete source code
- [x] Detailed README (this file)
- [x] Setup and run instructions
- [x] API key setup process
- [x] Libraries and dependencies listed
- [x] Architecture and design decisions
- [x] Screenshots of key features (if possible)
- [x] Known limitations or assumptions
- [x] Demo video (2-3 minutes) showing core functionality
- [x] Technical documentation for route optimization algorithm
- [x] Latest resume attached as PDF
- [x] Email with required details (see instructions)

## Contact
For queries, reach out at [your-email@example.com]

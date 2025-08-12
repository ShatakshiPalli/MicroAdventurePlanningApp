// Utility functions for distance calculation and route optimization
import { Coordinates, Milestone, OptimizedRoute, RouteSegment } from '../types/route';

export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const aVal =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

export function calculateDistanceMatrix(milestones: Milestone[], currentLocation: Coordinates): number[][] {
  const allPoints = [currentLocation, ...milestones.map(m => m.coordinates)];
  const matrix: number[][] = [];
  for (let i = 0; i < allPoints.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < allPoints.length; j++) {
      matrix[i][j] = haversineDistance(allPoints[i], allPoints[j]);
    }
  }
  return matrix;
}

export function nearestNeighborTSP(distances: number[][]): number[] {
  const n = distances.length;
  const visited = Array(n).fill(false);
  let order = [0];
  visited[0] = true;
  for (let i = 1; i < n; i++) {
    let last = order[order.length - 1];
    let next = -1;
    let minDist = Infinity;
    for (let j = 1; j < n; j++) {
      if (!visited[j] && distances[last][j] < minDist) {
        minDist = distances[last][j];
        next = j;
      }
    }
    order.push(next);
    visited[next] = true;
  }
  return order;
}

// 2-opt optimization for improved route efficiency
export function twoOptOptimization(order: number[], distances: number[][]): number[] {
  let improved = true;
  let bestOrder = [...order];
  
  while (improved) {
    improved = false;
    const currentDistance = calculateTotalDistance(bestOrder, distances);
    
    for (let i = 1; i < bestOrder.length - 1; i++) {
      for (let j = i + 1; j < bestOrder.length; j++) {
        // Create new order by reversing the segment between i and j
        const newOrder = [...bestOrder];
        const segment = newOrder.slice(i, j + 1).reverse();
        newOrder.splice(i, j - i + 1, ...segment);
        
        const newDistance = calculateTotalDistance(newOrder, distances);
        if (newDistance < currentDistance) {
          bestOrder = newOrder;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }
  
  return bestOrder;
}

export function reorderMilestones(milestones: Milestone[], order: number[]): Milestone[] {
  // order[0] is current location, skip it
  return order.slice(1).map((idx, i) => ({ ...milestones[idx - 1], order: i + 1 }));
}

export function calculateTotalDistance(order: number[], distances: number[][]): number {
  let total = 0;
  for (let i = 1; i < order.length; i++) {
    total += distances[order[i - 1]][order[i]];
  }
  return total;
}

export function calculateTotalTime(milestones: Milestone[], order: number[]): number {
  let time = 0;
  for (let i = 1; i < order.length; i++) {
    time += milestones[order[i] - 1]?.estimatedDuration || 0;
  }
  return time;
}

export function determineStartingPoint(currentLocation: Coordinates, milestones: Milestone[]): Milestone {
  // For now, just return the closest milestone
  let minDist = Infinity;
  let start: Milestone = milestones[0];
  for (const m of milestones) {
    const dist = haversineDistance(currentLocation, m.coordinates);
    if (dist < minDist) {
      minDist = dist;
      start = m;
    }
  }
  return start;
}

export function generateRouteSegments(order: number[], milestones: Milestone[], distances: number[][]): RouteSegment[] {
  const segments: RouteSegment[] = [];
  for (let i = 1; i < order.length; i++) {
    segments.push({
      from: milestones[order[i - 1] - 1],
      to: milestones[order[i] - 1],
      distance: distances[order[i - 1]][order[i]],
    });
  }
  return segments;
}

export function optimizeRoute(milestones: Milestone[], currentLocation: Coordinates): OptimizedRoute {
  if (milestones.length === 0) {
    return {
      milestones: [],
      totalDistance: 0,
      estimatedTotalTime: 0,
      startingPoint: null,
      routeSegments: []
    };
  }

  const distances = calculateDistanceMatrix(milestones, currentLocation);
  const initialOrder = nearestNeighborTSP(distances);
  
  // Apply 2-opt optimization for better results (bonus feature)
  const optimizedOrder = milestones.length > 3 ? twoOptOptimization(initialOrder, distances) : initialOrder;
  
  return {
    milestones: reorderMilestones(milestones, optimizedOrder),
    totalDistance: calculateTotalDistance(optimizedOrder, distances),
    estimatedTotalTime: calculateTotalTime(milestones, optimizedOrder),
    startingPoint: determineStartingPoint(currentLocation, milestones),
    routeSegments: generateRouteSegments(optimizedOrder, milestones, distances),
  };
}

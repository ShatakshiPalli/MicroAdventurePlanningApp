// Leaflet Map Component for Web
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Milestone } from '../types/route';

interface MapProps {
  milestones: Milestone[];
  userLocation?: { latitude: number; longitude: number };
  style?: any;
  onMilestonePress?: (milestone: Milestone) => void;
}

export default function LeafletMap({ milestones, userLocation, style, onMilestonePress }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current) {
      const L = require('leaflet');
      
      // Initialize map if not already created
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([22.5726, 88.3639], 10);
        
        // Add tile layer
        L.tileLayer('https://tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=pk.bb3ba6c4884db59d0c3bde27848f25fc', {
          attribution: '&copy; <a href="https://locationiq.com">LocationIQ</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
      }

      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.customMarker) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add user location marker
      if (userLocation) {
        L.marker([userLocation.latitude, userLocation.longitude], {
          customMarker: true,
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background: #007AFF; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,122,255,0.5);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(mapInstanceRef.current);
      }

      // Add milestone markers
      milestones.forEach((milestone, index) => {
        const marker = L.marker([milestone.coordinates.latitude, milestone.coordinates.longitude], {
          customMarker: true,
          icon: L.divIcon({
            className: 'milestone-marker',
            html: `<div style="
              background: ${milestone.completed ? '#34C759' : '#FF9500'};
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 12px;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">${milestone.order}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })
        }).addTo(mapInstanceRef.current);

        // Add click handler
        marker.on('click', () => {
          if (onMilestonePress) {
            onMilestonePress(milestone);
          }
        });

        // Add popup
        marker.bindPopup(`
          <div style="text-align: center;">
            <strong>${milestone.name}</strong><br>
            <small>${milestone.estimatedDuration} minutes</small><br>
            <small style="color: ${milestone.completed ? '#34C759' : '#FF9500'};">
              ${milestone.completed ? '✅ Completed' : '📍 Pending'}
            </small>
          </div>
        `);
      });

      // Draw route lines between milestones
      if (milestones.length > 1) {
        const routeCoords = milestones.map(m => [m.coordinates.latitude, m.coordinates.longitude]);
        
        L.polyline(routeCoords, {
          customMarker: true,
          color: '#007AFF',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 10'
        }).addTo(mapInstanceRef.current);
      }

      // Fit map to show all markers
      if (milestones.length > 0) {
        const group = new L.featureGroup(
          milestones.map(m => L.marker([m.coordinates.latitude, m.coordinates.longitude]))
        );
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      } else if (userLocation) {
        mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 13);
      }
    }
  }, [milestones, userLocation]);

  // For React Native, show a placeholder
  if (typeof window === 'undefined') {
    return (
      <View style={[styles.mapPlaceholder, style]}>
        <Text style={styles.mapPlaceholderText}>Map View</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          {milestones.length} milestone{milestones.length !== 1 ? 's' : ''} planned
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

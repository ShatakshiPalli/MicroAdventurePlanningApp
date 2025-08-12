// Timeline visualization component for milestones
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Milestone } from '../types/route';

interface TimelineProps {
  milestones: Milestone[];
  currentMilestoneId?: string;
  onMilestonePress?: (milestone: Milestone) => void;
}

export default function Timeline({ milestones, currentMilestoneId, onMilestonePress }: TimelineProps) {
  return (
    <ScrollView horizontal style={styles.timeline} showsHorizontalScrollIndicator={false}>
      {milestones.map((m, idx) => (
        <TouchableOpacity
          key={m.id}
          style={[styles.item, m.id === currentMilestoneId && styles.current]}
          onPress={() => onMilestonePress && onMilestonePress(m)}
        >
          <View style={[styles.circle, m.completed && styles.completed]}>
            <Text style={styles.order}>{m.order}</Text>
          </View>
          <Text style={styles.name}>{m.name}</Text>
          <Text style={styles.duration}>{m.estimatedDuration} min</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  timeline: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  item: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  current: {
    borderColor: '#007AFF',
    borderWidth: 2,
    borderRadius: 8,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eaf4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  completed: {
    backgroundColor: '#4CD964',
  },
  order: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
});

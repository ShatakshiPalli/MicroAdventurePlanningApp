// Milestone persistence using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Milestone } from '../types/route';

const MILESTONES_KEY = 'micro_adventure_milestones';

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

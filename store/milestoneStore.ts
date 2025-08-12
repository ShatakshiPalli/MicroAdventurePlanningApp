// Milestone state management using Zustand with offline persistence
import { create } from 'zustand';
import { loadMilestones, saveMilestones } from '../services/storageService';
import { Milestone } from '../types/route';

interface MilestoneState {
  milestones: Milestone[];
  addMilestone: (milestone: Milestone) => void;
  removeMilestone: (id: string) => void;
  reorderMilestones: (milestones: Milestone[]) => void;
  updateMilestone: (milestone: Milestone) => void;
  clearMilestones: () => void;
  setMilestones: (milestones: Milestone[]) => void;
  loadStoredMilestones: () => Promise<void>;
}

export const useMilestoneStore = create<MilestoneState>((set, get) => ({
  milestones: [],

  addMilestone: (milestone) => {
    if (!milestone || !milestone.id) return;
    const newMilestones = [...get().milestones, milestone];
    set({ milestones: newMilestones });
    saveMilestones(newMilestones);
  },

  removeMilestone: (id) => {
    if (!id) return;
    const newMilestones = get().milestones.filter(m => m.id !== id);
    // Reorder remaining milestones
    const reorderedMilestones = newMilestones.map((m, i) => ({ ...m, order: i + 1 }));
    set({ milestones: reorderedMilestones });
    saveMilestones(reorderedMilestones);
  },

  reorderMilestones: (milestones) => {
    if (!Array.isArray(milestones)) return;
    set({ milestones });
    saveMilestones(milestones);
  },

  updateMilestone: (milestone) => {
    if (!milestone || !milestone.id) return;
    const newMilestones = get().milestones.map(m => m.id === milestone.id ? milestone : m);
    set({ milestones: newMilestones });
    saveMilestones(newMilestones);
  },

  clearMilestones: () => {
    set({ milestones: [] });
    saveMilestones([]);
  },

  setMilestones: (milestones) => {
    if (!Array.isArray(milestones)) return;
    set({ milestones });
    saveMilestones(milestones);
  },

  loadStoredMilestones: async () => {
    const storedMilestones = await loadMilestones();
    set({ milestones: Array.isArray(storedMilestones) ? storedMilestones : [] });
  },
}));

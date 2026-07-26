import { defineStore } from 'pinia';

const STORAGE_KEY = 'tns.selectedTarget';

export const useTargetStore = defineStore('target', {
  state: () => ({
    selectedTarget: null,
  }),

  actions: {
    loadSavedTarget() {
      const savedTarget = localStorage.getItem(STORAGE_KEY);

      if (!savedTarget) {
        return;
      }

      try {
        this.selectedTarget = JSON.parse(savedTarget);
      } catch (error) {
        console.error('Could not load saved target:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    setTarget(target) {
      this.selectedTarget = target;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
    },

    clearTarget() {
      this.selectedTarget = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

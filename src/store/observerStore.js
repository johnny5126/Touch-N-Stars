import { defineStore } from 'pinia';

const STORAGE_KEY = 'tns.observerProfile';

export const useObserverStore = defineStore('observer', {
  state: () => ({
    latitude: null,
    longitude: null,
    elevation: 0,
    minimumAltitude: 30,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }),

  actions: {
    loadSavedObserver() {
      const savedObserver = localStorage.getItem(STORAGE_KEY);

      if (!savedObserver) {
        return;
      }

      try {
        const observer = JSON.parse(savedObserver);

        this.latitude = observer.latitude ?? null;
        this.longitude = observer.longitude ?? null;
        this.elevation = observer.elevation ?? 0;
        this.minimumAltitude = observer.minimumAltitude ?? 30;
        this.timeZone = observer.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (error) {
        console.error('Could not load observer profile:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    saveObserver(observer) {
      this.latitude = Number(observer.latitude);
      this.longitude = Number(observer.longitude);
      this.elevation = Number(observer.elevation) || 0;
      this.minimumAltitude = Number(observer.minimumAltitude) || 30;
      this.timeZone = observer.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          latitude: this.latitude,
          longitude: this.longitude,
          elevation: this.elevation,
          minimumAltitude: this.minimumAltitude,
          timeZone: this.timeZone,
        })
      );
    },

    clearObserver() {
      this.latitude = null;
      this.longitude = null;
      this.elevation = 0;
      this.minimumAltitude = 30;
      this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      localStorage.removeItem(STORAGE_KEY);
    },
  },

  getters: {
    hasLocation: (state) => {
      return Number.isFinite(state.latitude) && Number.isFinite(state.longitude);
    },
  },
});

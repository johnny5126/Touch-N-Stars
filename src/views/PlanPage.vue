<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTargetStore } from '@/store/targetStore';
import { useObserverStore } from '@/store/observerStore';
import { calculateTargetPosition, calculateImagingWindow } from '@/services/astronomyService';

const router = useRouter();
const targetStore = useTargetStore();
const observerStore = useObserverStore();

const observerForm = ref({
  latitude: '',
  longitude: '',
  elevation: 0,
  minimumAltitude: 30,
});
const targetPosition = ref(null);
const imagingWindow = ref(null);
const positionError = ref('');
const dualTrainMode = ref(true);

const trainA = ref({
  exposure: 300,
  frames: 100,
  gain: 100,
  offset: 50,
});

const trainB = ref({
  exposure: 180,
  frames: 120,
  gain: 100,
  offset: 50,
});

onMounted(() => {
  targetStore.loadSavedTarget();
  observerStore.loadSavedObserver();

  if (observerStore.hasLocation) {
    observerForm.value.latitude = observerStore.latitude;
    observerForm.value.longitude = observerStore.longitude;
    observerForm.value.elevation = observerStore.elevation;
    observerForm.value.minimumAltitude = observerStore.minimumAltitude;
  }
  updateTargetPosition();
});

const trainASeconds = computed(() => trainA.value.exposure * trainA.value.frames);

const trainBSeconds = computed(() => {
  if (!dualTrainMode.value) return 0;
  return trainB.value.exposure * trainB.value.frames;
});

const sessionSeconds = computed(() => Math.max(trainASeconds.value, trainBSeconds.value));

const totalFrames = computed(() => {
  return trainA.value.frames + (dualTrainMode.value ? trainB.value.frames : 0);
});

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
function formatTime(date) {
  if (!date) return '--';

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const imagingDuration = computed(() => {
  if (!imagingWindow.value || imagingWindow.value.status !== 'available') {
    return '--';
  }

  return formatDuration(Math.round(imagingWindow.value.durationHours * 3600));
});
const sessionHours = computed(() => formatDuration(sessionSeconds.value));
const trainAHours = computed(() => formatDuration(trainASeconds.value));
const trainBHours = computed(() => formatDuration(trainBSeconds.value));
const combinedSeconds = computed(() => trainASeconds.value + trainBSeconds.value);
const combinedHours = computed(() => formatDuration(combinedSeconds.value));
const targetRating = computed(() => {
  if (!targetPosition.value) {
    return 'Not calculated';
  }

  const altitude = targetPosition.value.altitude;

  if (altitude >= 70) return '⭐⭐⭐⭐⭐ Excellent';
  if (altitude >= 55) return '⭐⭐⭐⭐ Very Good';
  if (altitude >= 40) return '⭐⭐⭐ Good';
  if (altitude >= observerStore.minimumAltitude) return '⭐⭐ Fair';

  return '⭐ Poor';
});
function chooseTarget() {
  router.push('/choose-target');
}
function updateTargetPosition() {
  positionError.value = '';
  targetPosition.value = null;
  imagingWindow.value = null;

  if (!targetStore.selectedTarget || !observerStore.hasLocation) {
    return;
  }

  try {
    const now = new Date();

    targetPosition.value = calculateTargetPosition({
      target: targetStore.selectedTarget,
      latitude: observerStore.latitude,
      longitude: observerStore.longitude,
      elevation: observerStore.elevation,
      date: now,
    });

    imagingWindow.value = calculateImagingWindow({
      target: targetStore.selectedTarget,
      latitude: observerStore.latitude,
      longitude: observerStore.longitude,
      elevation: observerStore.elevation,
      minimumAltitude: observerStore.minimumAltitude,
      startDate: now,
    });
  } catch (error) {
    positionError.value = error.message;
    console.error('Could not calculate target information:', error);
  }
}
function saveObserverLocation() {
  observerStore.saveObserver(observerForm.value);
  updateTargetPosition();
}
async function detectLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      observerForm.value.latitude = Number(position.coords.latitude.toFixed(6));

      observerForm.value.longitude = Number(position.coords.longitude.toFixed(6));

      if (position.coords.altitude !== null) {
        observerForm.value.elevation = Math.round(position.coords.altitude);
      }
    },
    (error) => {
      alert(`Unable to retrieve your location.\n\n${error.message}`);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
}
</script>

<template>
  <div class="plan-page">
    <aside class="side-nav">
      <div class="logo">TNS</div>

      <button class="nav-btn"><span class="nav-icon">🔭</span><span>Preview</span></button>
      <button class="nav-btn"><span class="nav-icon">🎯</span><span>Focus</span></button>
      <button class="nav-btn"><span class="nav-icon">🧭</span><span>PA</span></button>
      <button class="nav-btn"><span class="nav-icon">⭐</span><span>Guide</span></button>
      <button class="nav-btn active"><span class="nav-icon">📋</span><span>Plan</span></button>
      <button class="nav-btn"><span class="nav-icon">📁</span><span>Files</span></button>
      <button class="nav-btn"><span class="nav-icon">⚙️</span><span>Settings</span></button>
    </aside>

    <main class="plan-main">
      <section class="plan-header">
        <div>
          <h1>Plan Session</h1>
          <p>Create a single- or dual-train imaging sequence.</p>
        </div>

        <div class="mode-switch">
          <button
            class="mode-btn"
            :class="{ active: !dualTrainMode }"
            @click="dualTrainMode = false"
          >
            Single Train
          </button>
          <button class="mode-btn" :class="{ active: dualTrainMode }" @click="dualTrainMode = true">
            Dual Train
          </button>
        </div>
      </section>

      <section class="target-card">
        <div class="target-content">
          <span class="section-label">Target</span>

          <template v-if="targetStore.selectedTarget">
            <h2>
              {{ targetStore.selectedTarget.name }} •
              {{ targetStore.selectedTarget.commonName }}
            </h2>

            <p>
              {{ targetStore.selectedTarget.type }} •
              {{ targetStore.selectedTarget.constellation }}
            </p>

            <p class="target-coordinates">
              RA {{ targetStore.selectedTarget.ra }} • DEC {{ targetStore.selectedTarget.dec }}
            </p>

            <div class="target-stats">
              <div class="target-stat">
                <span>Rating</span>
                <strong>{{ targetRating }}</strong>
              </div>
              <div class="target-stat">
                <span>Altitude</span>
                <strong>
                  {{
                    targetPosition
                      ? targetPosition.altitudeDisplay
                      : observerStore.hasLocation
                        ? 'Calculating...'
                        : 'Location required'
                  }}
                </strong>
              </div>
              <div class="target-stat">
                <span>Azimuth</span>
                <strong>
                  {{
                    targetPosition
                      ? targetPosition.azimuthDisplay
                      : observerStore.hasLocation
                        ? 'Calculating...'
                        : 'Location required'
                  }}
                </strong>
              </div>
              <div class="target-stat">
                <span>Visible</span>
                <strong>
                  {{
                    targetPosition
                      ? targetPosition.altitude >= observerStore.minimumAltitude
                        ? 'Visible'
                        : 'Below Minimum'
                      : observerStore.hasLocation
                        ? 'Calculating...'
                        : 'Location required'
                  }}
                </strong>
              </div>
            </div>

            <div
              v-if="imagingWindow && imagingWindow.status === 'available'"
              class="imaging-window"
            >
              <div class="imaging-window-heading">
                <span class="section-label">Tonight's Imaging Window</span>
              </div>

              <div class="imaging-window-grid">
                <div class="window-stat">
                  <span>Starts</span>
                  <strong>{{ formatTime(imagingWindow.start) }}</strong>
                </div>

                <div class="window-stat">
                  <span>Transit</span>
                  <strong>{{ formatTime(imagingWindow.transit) }}</strong>
                </div>

                <div class="window-stat">
                  <span>Ends</span>
                  <strong>{{ formatTime(imagingWindow.end) }}</strong>
                </div>

                <div class="window-stat">
                  <span>Available</span>
                  <strong>{{ imagingDuration }}</strong>
                </div>
              </div>
            </div>

            <p v-else-if="observerStore.hasLocation && imagingWindow" class="window-unavailable">
              This target does not rise above your minimum altitude during the next 24 hours.
            </p>
          </template>

          <template v-else>
            <h2>No target selected</h2>
            <p>Choose an object to begin planning the session.</p>
          </template>
        </div>

        <button class="secondary-btn target-action-btn" @click="chooseTarget">
          {{ targetStore.selectedTarget ? 'Change Target' : 'Choose Target' }}
        </button>
      </section>

      <section class="observer-card">
        <div class="observer-heading">
          <div>
            <span class="section-label">Observer Location</span>
            <h2>Imaging Site</h2>
            <p>Used to calculate altitude, visibility, and tonight’s imaging window.</p>
          </div>

          <span v-if="observerStore.hasLocation" class="saved-status">● Saved</span>
        </div>

        <div class="observer-grid">
          <label>
            Latitude
            <input v-model="observerForm.latitude" type="number" step="any" placeholder="40.7128" />
          </label>
          <label>
            Longitude
            <input
              v-model="observerForm.longitude"
              type="number"
              step="any"
              placeholder="-74.0060"
            />
          </label>
          <label>
            Elevation
            <input v-model="observerForm.elevation" type="number" step="1" />
          </label>
          <label>
            Minimum Altitude
            <input v-model="observerForm.minimumAltitude" type="number" min="0" max="90" step="1" />
          </label>
        </div>

        <div class="observer-buttons">
          <button class="secondary-btn" @click="detectLocation">📍 Detect My Location</button>

          <button class="save-location-btn" @click="saveObserverLocation">Save Location</button>
        </div>
      </section>

      <section class="train-grid">
        <article class="train-card" :class="{ 'single-train-card': !dualTrainMode }">
          <div class="card-heading">
            <div>
              <span class="section-label">Imaging Train A</span>
              <h2>Widefield</h2>
            </div>
            <span class="enabled-status">● Enabled</span>
          </div>

          <div class="field-grid">
            <label>Exposure<input v-model.number="trainA.exposure" type="number" /></label>
            <label>Frames<input v-model.number="trainA.frames" type="number" /></label>
            <label>Gain<input v-model.number="trainA.gain" type="number" /></label>
            <label>Offset<input v-model.number="trainA.offset" type="number" /></label>
            <label class="wide-field"
              >Filter
              <select>
                <option>Ha / OIII</option>
                <option>SII / OIII</option>
                <option>Broadband</option>
              </select>
            </label>
          </div>
        </article>

        <article v-if="dualTrainMode" class="train-card">
          <div class="card-heading">
            <div>
              <span class="section-label">Imaging Train B</span>
              <h2>Narrowband</h2>
            </div>
            <span class="enabled-status">● Enabled</span>
          </div>

          <div class="field-grid">
            <label>Exposure<input v-model.number="trainB.exposure" type="number" /></label>
            <label>Frames<input v-model.number="trainB.frames" type="number" /></label>
            <label>Gain<input v-model.number="trainB.gain" type="number" /></label>
            <label>Offset<input v-model.number="trainB.offset" type="number" /></label>
            <label class="wide-field"
              >Filter
              <select>
                <option>Broadband</option>
                <option>Ha / OIII</option>
                <option>SII / OIII</option>
              </select>
            </label>
          </div>
        </article>
      </section>

      <section class="options-grid">
        <article v-if="dualTrainMode" class="options-card">
          <span class="section-label">Synchronization</span>
          <label class="check-row"
            ><input type="checkbox" checked />Start both trains together</label
          >
          <label class="check-row"
            ><input type="checkbox" checked />Dither after both trains finish</label
          >
          <label class="check-row"
            ><input type="checkbox" checked />Pause both during autofocus</label
          >
          <label class="check-row"
            ><input type="checkbox" checked />Synchronize meridian flip</label
          >
        </article>

        <article class="options-card" :class="{ 'single-options-card': !dualTrainMode }">
          <span class="section-label">Session Options</span>
          <label class="check-row"
            ><input type="checkbox" checked />Autofocus every 60 minutes</label
          >
          <label class="check-row"
            ><input type="checkbox" checked />Warm cameras when finished</label
          >
          <label class="check-row"><input type="checkbox" checked />Park mount when finished</label>
          <label class="check-row"><input type="checkbox" />Shut down mini PC</label>
        </article>
      </section>

      <section class="session-summary">
        <div class="summary-heading">
          <div>
            <span class="section-label">Session Summary</span>
            <h2>Ready to Begin</h2>
          </div>
          <button class="start-btn">▶ Start Session</button>
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Elapsed Time</span><strong>{{ sessionHours }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Train A Integration</span><strong>{{ trainAHours }}</strong
            ><small>{{ trainA.frames }} frames</small>
          </div>
          <div v-if="dualTrainMode" class="summary-item">
            <span class="summary-label">Train B Integration</span><strong>{{ trainBHours }}</strong
            ><small>{{ trainB.frames }} frames</small>
          </div>
          <div class="summary-item highlight">
            <span class="summary-label">Combined Integration</span
            ><strong>{{ combinedHours }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Frames</span><strong>{{ totalFrames }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Estimated Storage</span><strong>18.4 GB</strong>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.plan-page {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  width: 100vw;
  height: 100vh;
  background: #0b1018;
  color: #e8eef8;
  font-family: Arial, sans-serif;
  overflow: hidden;
}

.side-nav {
  min-width: 0;
  background: #111927;
  border-right: 1px solid #253044;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.logo {
  width: 100%;
  height: 60px;
  flex-shrink: 0;
  border-radius: 16px;
  background: #1d2a3d;
  display: grid;
  place-items: center;
  color: #7cc7ff;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.nav-btn {
  width: 100%;
  min-height: 62px;
  flex-shrink: 0;
  border: 0;
  border-radius: 14px;
  padding: 0 16px;
  background: #182235;
  color: #cbd8ea;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.nav-icon {
  width: 28px;
  flex: 0 0 28px;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.nav-btn.active,
.nav-btn:hover {
  background: #2278c9;
  color: white;
}

.plan-main {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.plan-header,
.target-card,
.observer-card,
.train-card,
.options-card,
.session-summary {
  border-radius: 18px;
  background: #111927;
  border: 1px solid #26354d;
}

.plan-header {
  min-height: 90px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.plan-header h1,
.target-card h2,
.observer-card h2,
.train-card h2,
.summary-heading h2 {
  margin: 0;
}

.plan-header p,
.target-card p,
.observer-heading p {
  margin: 6px 0 0;
  color: #9fb1c8;
}

.mode-switch {
  display: flex;
  gap: 8px;
  padding: 5px;
  border-radius: 14px;
  background: #0c1420;
}

.mode-btn {
  border: 0;
  border-radius: 10px;
  padding: 11px 16px;
  background: transparent;
  color: #9fb1c8;
  font-weight: 700;
  cursor: pointer;
}

.mode-btn.active {
  background: #2278c9;
  color: white;
}

.target-card {
  padding: 18px 22px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 22px;
}

.target-content {
  min-width: 0;
}
.target-action-btn {
  align-self: center;
  white-space: nowrap;
}

.section-label,
.summary-label {
  display: block;
  margin-bottom: 7px;
  color: #7cc7ff;
  font-size: 13px;
  font-weight: 700;
}

.target-coordinates {
  margin-top: 6px !important;
  color: #7f95b2 !important;
  font-size: 13px;
}

.target-stats {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.target-stat {
  padding: 12px;
  border-radius: 12px;
  background: #0c1420;
  border: 1px solid #26354d;
}

.target-stat span {
  display: block;
  margin-bottom: 5px;
  color: #8ea4c2;
  font-size: 12px;
  font-weight: 600;
}

.target-stat strong {
  display: block;
  color: #e8eef8;
  font-size: 16px;
  font-weight: 700;
}
.imaging-window {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #26354d;
  border-radius: 14px;
  background: #0c1420;
}

.imaging-window-heading {
  margin-bottom: 14px;
}

.imaging-window-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.window-stat {
  display: flex;
  flex-direction: column;
}

.window-stat span {
  color: #8ea4c2;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 5px;
}

.window-stat strong {
  color: #e8eef8;
  font-size: 17px;
  font-weight: 700;
}

.window-unavailable {
  margin-top: 18px;
  color: #9fb1c8;
}
.secondary-btn,
.start-btn,
.secondary-btn {
  background: #1e2b41;
  border: 1px solid #334864;
}

.save-location-btn {
  background: #2278c9;
}
.observer-buttons {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.observer-buttons button {
  width: 220px;
  height: 52px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.observer-card {
  padding: 18px 22px;
}

.observer-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.saved-status {
  color: #69e28f;
  font-size: 13px;
  font-weight: 700;
}

.observer-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.observer-grid label,
.field-grid label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: #9fb1c8;
  font-size: 13px;
  font-weight: 700;
}

.save-location-btn {
  margin-top: 16px;
  padding: 12px 18px;
  background: #2278c9;
  font-size: 14px;
}

.train-grid,
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.train-card,
.options-card {
  padding: 18px;
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.enabled-status {
  color: #69e28f;
  font-size: 13px;
  font-weight: 700;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.wide-field {
  grid-column: 1 / -1;
}

input,
select {
  min-width: 0;
  border: 1px solid #334864;
  border-radius: 10px;
  padding: 11px 12px;
  background: #0c1420;
  color: #e8eef8;
  font-size: 14px;
  outline: none;
}

input:focus,
select:focus {
  border-color: #2f83e4;
}

.options-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d5e3f5;
  font-size: 14px;
}

.check-row input {
  width: 17px;
  height: 17px;
  accent-color: #2278c9;
}

.session-summary {
  padding: 18px 20px;
}

.summary-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(150px, 1fr));
  gap: 12px;
}

.summary-item {
  min-width: 0;
  padding: 15px;
  border: 1px solid #2c3d58;
  border-radius: 14px;
  background: #0c1420;
}

.summary-item strong {
  display: block;
  font-size: 21px;
}

.summary-item small {
  display: block;
  margin-top: 6px;
  color: #8397b1;
  font-size: 12px;
}

.summary-item.highlight {
  border-color: #2278c9;
  background: #10233a;
}

.summary-item.highlight strong {
  color: #7cc7ff;
}

.start-btn {
  background: #2278c9;
  padding: 13px 24px;
}

@media (max-width: 1000px) {
  .plan-page {
    grid-template-columns: 190px minmax(0, 1fr);
  }
  .train-grid,
  .options-grid {
    grid-template-columns: 1fr;
  }
  .target-card {
    grid-template-columns: 1fr;
  }
  .target-action-btn {
    width: 100%;
  }
  .observer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .single-train-card,
  .single-options-card {
    grid-column: 1 / -1;
  }
}
</style>

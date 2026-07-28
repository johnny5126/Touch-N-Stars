<script setup>
import { computed, ref } from 'vue';
const hasMeasurement = ref(false);
const isAligned = computed(() => {
  return hasMeasurement.value && Math.abs(targetX.value) <= 4 && Math.abs(targetY.value) <= 4;
});

const previewStatus = computed(() => {
  if (isAligned.value) {
    return 'Aligned';
  }

  if (isBusy.value) {
    if (alignmentStatus.value.toLowerCase().includes('solving')) {
      return 'Solving...';
    }

    if (alignmentStatus.value.toLowerCase().includes('capturing')) {
      return 'Capturing...';
    }

    if (alignmentStatus.value.toLowerCase().includes('calculating')) {
      return 'Calculating...';
    }
  }

  if (hasMeasurement.value) {
    return 'Plate Solved';
  }

  return 'Ready';
});

const previewStatusClass = computed(() => ({
  aligned: isAligned.value,
  working: isBusy.value,
}));

const displayedPolarError = computed(() => {
  if (isAligned.value) {
    return `0' 18"`;
  }

  return polarError.value || 'Not measured';
});
const exposure = ref(2);
const gain = ref(100);
const rotationAngle = ref(60);
const selectedCamera = ref('ASI2600MC Pro');

const alignmentStarted = ref(false);
const currentStep = ref(1);
const alignmentStatus = ref('Ready to begin');

const polarError = ref(null);
const altitudeCorrection = ref(null);
const azimuthCorrection = ref(null);
const alignmentQuality = ref(null);
const progress = ref(0);
const isBusy = ref(false);
const starsFound = ref(143);
const solveTime = ref('0.82 s');
const exposureRemaining = ref('2.0 s');
const targetX = ref(-32);
const targetY = ref(24);
const previewRotation = ref(0);
const mountRotation = ref(0);
const starColors = ['#ffffff', '#d7e8ff', '#ffe9b5', '#cfe6ff'];

const stars = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  opacity: 0.45 + Math.random() * 0.55,
  color: starColors[Math.floor(Math.random() * starColors.length)],
  delay: Math.random() * 3,
}));
const adjustmentDirection = 'NE';
async function captureExposure(seconds) {
  const interval = 100;
  const total = seconds * 1000;

  for (let elapsed = 0; elapsed <= total; elapsed += interval) {
    const remaining = Math.max(0, seconds - elapsed / 1000);
    exposureRemaining.value = `${remaining.toFixed(1)} s`;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  exposureRemaining.value = '0.0 s';
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function startPolarAlignment() {
  if (isBusy.value) {
    return;
  }

  alignmentStarted.value = true;
  isBusy.value = true;
  hasMeasurement.value = false;

  polarError.value = null;
  altitudeCorrection.value = null;
  azimuthCorrection.value = null;
  alignmentQuality.value = null;

  targetX.value = -32;
  targetY.value = 24;

  // Step 1: Capture and solve the first image
  currentStep.value = 1;
  progress.value = 15;
  alignmentStatus.value = 'Capturing first star field';

  await captureExposure(exposure.value);

  alignmentStatus.value = 'Plate solving first image...';
  progress.value = 30;

  await wait(1800);

  // Step 2: Rotate the mount automatically
  currentStep.value = 2;
  progress.value = 45;
  alignmentStatus.value = `Rotating mount ${rotationAngle.value}°`;

  previewRotation.value = rotationAngle.value;
  mountRotation.value = rotationAngle.value;

  await wait(2200);

  previewRotation.value = 0;

  // Step 3: Capture and solve the second image
  currentStep.value = 3;
  progress.value = 60;
  alignmentStatus.value = 'Capturing second star field';

  await captureExposure(exposure.value);

  alignmentStatus.value = 'Plate solving second image...';
  progress.value = 75;

  await wait(1800);

  // Step 4: Calculate the polar error
  currentStep.value = 4;
  progress.value = 90;
  alignmentStatus.value = 'Calculating polar alignment error';

  await wait(1500);

  // Step 5: Display the adjustment result
  currentStep.value = 5;
  progress.value = 100;
  hasMeasurement.value = true;

  polarError.value = `3' 18"`;
  altitudeCorrection.value = `Raise 1.8'`;
  azimuthCorrection.value = `Move Left 2.4'`;
  alignmentQuality.value = 'Needs Adjustment';
  alignmentStatus.value = 'Adjust mount altitude and azimuth';

  isBusy.value = false;

  setTimeout(() => {
    simulateMountAdjustment();
  }, 1000);
}

function continueAlignment() {
  if (currentStep.value === 1) {
    isBusy.value = true;

    alignmentStatus.value = 'Plate solving first image...';

    setTimeout(() => {
      currentStep.value = 2;

      alignmentStatus.value = `Rotate the mount ${rotationAngle.value}°`;

      progress.value = 35;

      isBusy.value = false;
    }, 1800);

    return;
  }
  function simulateMountAdjustment() {
    if (!hasMeasurement.value || isBusy.value) {
      return;
    }

    isBusy.value = true;
    alignmentStatus.value = 'Monitoring mount adjustment';

    const adjustmentTimer = setInterval(() => {
      targetX.value *= 0.72;
      targetY.value *= 0.72;

      if (Math.abs(targetX.value) <= 4 && Math.abs(targetY.value) <= 4) {
        targetX.value = 0;
        targetY.value = 0;

        polarError.value = `0' 18"`;
        altitudeCorrection.value = 'Centered';
        azimuthCorrection.value = 'Centered';
        alignmentQuality.value = 'Excellent';

        alignmentStatus.value = 'Excellent alignment';
        isBusy.value = false;

        clearInterval(adjustmentTimer);
      }
    }, 450);
  }
  if (currentStep.value === 2) {
    isBusy.value = true;

    currentStep.value = 3;
    alignmentStatus.value = 'Capturing second star field';
    progress.value = 60;

    setTimeout(() => {
      alignmentStatus.value = 'Plate solving second image...';

      setTimeout(() => {
        currentStep.value = 4;
        alignmentStatus.value = 'Calculating polar alignment error';
        progress.value = 85;

        setTimeout(() => {
          currentStep.value = 5;
          hasMeasurement.value = true;
          alignmentStatus.value = 'Alignment complete';
          progress.value = 100;
          setTimeout(() => {
            simulateMountAdjustment();
          }, 1000);
          polarError.value = `3' 18"`;
          altitudeCorrection.value = `Raise 1.8'`;
          azimuthCorrection.value = `Move Left 2.4'`;
          alignmentQuality.value = 'Needs Adjustment';

          isBusy.value = false;
        }, 1500);
      }, 1800);
    }, 1800);

    return;
  }

  if (currentStep.value === 3) {
    currentStep.value = 4;
    alignmentStatus.value = 'Calculating polar alignment error';
    progress.value = 85;
    return;
  }

  if (currentStep.value === 4) {
    currentStep.value = 5;
    alignmentStatus.value = 'Alignment complete';
    progress.value = 100;

    polarError.value = `3' 18"`;
    altitudeCorrection.value = `Raise 1.8'`;
    azimuthCorrection.value = `Move Left 2.4'`;
    alignmentQuality.value = 'Needs Adjustment';

    return;
  }
  if (currentStep.value === 5) {
    startPolarAlignment();
    return;
  }
}
</script>

<template>
  <main class="pa-page">
    <header class="pa-header">
      <div>
        <p class="pa-eyebrow">Mount Setup</p>
        <h1>Polar Alignment</h1>
        <p class="pa-subtitle">Align your mount accurately before beginning the imaging session.</p>
      </div>

      <div class="connection-status">
        <span class="status-dot"></span>
        <div>
          <strong>AM5 Connected</strong>
          <span>Mount ready</span>
        </div>
      </div>
    </header>

    <section class="pa-layout">
      <div class="pa-settings-card">
        <div class="card-heading">
          <div>
            <p class="section-label">Equipment</p>
            <h2>Alignment Settings</h2>
          </div>

          <span class="ready-badge">Ready</span>
        </div>

        <div class="settings-grid">
          <label class="setting-field">
            <span>Mount</span>
            <div class="readonly-value">
              <span class="equipment-icon">✦</span>
              <strong>ZWO AM5</strong>
            </div>
          </label>

          <label class="setting-field">
            <span>Camera</span>
            <select v-model="selectedCamera" :disabled="alignmentStarted">
              <option>ASI2600MC Pro</option>
              <option>Imaging Train A</option>
              <option>Imaging Train B</option>
            </select>
          </label>

          <label class="setting-field">
            <span>Exposure</span>
            <select v-model.number="exposure" :disabled="alignmentStarted">
              <option :value="1">1 second</option>
              <option :value="2">2 seconds</option>
              <option :value="3">3 seconds</option>
              <option :value="5">5 seconds</option>
              <option :value="10">10 seconds</option>
            </select>
          </label>

          <label class="setting-field">
            <span>Gain</span>
            <input v-model.number="gain" type="number" min="0" max="500" step="1" />
          </label>

          <div class="setting-field">
            <span>Plate Solver</span>
            <div class="readonly-value">
              <span class="solver-indicator"></span>
              <strong>Configured</strong>
            </div>
          </div>
        </div>

        <div class="mount-illustration" aria-label="AM5 mount and telescope">
          <img src="@/assets/am5-mount.png" alt="AM5 mount and telescope" class="mount-image" />
        </div>
      </div>

      <aside class="pa-preview-card">
        <div class="camera-preview">
          <div class="preview-header">
            <span>Polar Alignment Preview</span>

            <div class="alignment-preview-status">
              <span class="preview-status-dot" :class="previewStatusClass"></span>

              <div>
                <small>Status</small>
                <strong>{{ previewStatus }}</strong>
              </div>
            </div>
          </div>

          <div class="preview-window">
            <div class="preview-stars">
              <span
                v-for="star in stars"
                :key="star.id"
                class="preview-star"
                :style="{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  background: star.color,
                  animationDelay: `${star.delay}s`,
                }"
              ></span>
            </div>

            <div class="preview-crosshair horizontal"></div>
            <div class="preview-crosshair vertical"></div>

            <div class="polar-target preview-polar-target">
              <div class="target-north">
                <span class="north-letter">N</span>
                <span class="north-arrow"></span>
              </div>

              <div
                class="polar-circle"
                :style="{
                  transform: `translate(-50%, -50%) rotate(${previewRotation}deg)`,
                }"
              >
                <div class="ring ring1"></div>
                <div class="ring ring2"></div>
                <div class="ring ring3"></div>
                <div class="ring ring4"></div>

                <div class="crosshair horizontal"></div>
                <div class="crosshair vertical"></div>

                <div class="bullseye"></div>

                <div
                  class="current-position"
                  :class="{ aligned: isAligned }"
                  :style="{
                    transform: `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px))`,
                  }"
                >
                  <span class="error-badge">
                    {{ displayedPolarError }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="preview-footer">
            <div class="preview-stat">
              <svg class="stat-icon stat-icon-stars" viewBox="0 0 32 32" aria-hidden="true">
                <path
                  d="M16 2l2.2 8.1L26 12l-7.8 2L16 22l-2.2-8L6 12l7.8-1.9L16 2z"
                  fill="currentColor"
                />
              </svg>

              <small>Stars</small>
              <strong>{{ starsFound }}</strong>
            </div>

            <div class="preview-stat">
              <svg class="stat-icon" viewBox="0 0 32 32" aria-hidden="true">
                <polyline
                  points="2,18 7,18 10,12 14,24 18,8 22,18 30,18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <small>HFR</small>
              <strong>2.41&quot;</strong>
            </div>

            <div class="preview-stat">
              <svg class="stat-icon" viewBox="0 0 32 32" aria-hidden="true">
                <circle
                  cx="16"
                  cy="16"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.4"
                />

                <line
                  x1="16"
                  y1="16"
                  x2="16"
                  y2="10"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                />

                <line
                  x1="16"
                  y1="16"
                  x2="20"
                  y2="19"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                />
              </svg>

              <small>Solve Time</small>
              <strong>{{ solveTime }}</strong>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <section class="instruction-card">
      <template v-if="!alignmentStarted">
        <div class="instruction-icon">1</div>

        <div class="instruction-copy">
          <h2>Prepare the mount</h2>
          <p>
            Make sure the mount can rotate freely through the selected RA angle. Touch-N-Stars will
            capture and plate solve two positions to calculate the current alignment error.
          </p>
        </div>

        <button class="start-pa-btn" @click="startPolarAlignment">
          <span>Start Polar Alignment</span>
          <span class="button-arrow">→</span>
        </button>
      </template>

      <template v-else>
        <div class="instruction-icon">{{ currentStep }}</div>

        <div class="instruction-copy">
          <p class="section-label">
            {{ currentStep === 5 ? 'Alignment Result' : `Step ${currentStep} of 4` }}
          </p>

          <h2>{{ alignmentStatus }}</h2>

          <div class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <div class="progress-text">{{ progress }}% Complete</div>
          </div>

          <div v-if="currentStep !== 5" class="operation-card">
            <p class="section-label">Current Operation</p>

            <div v-if="currentStep === 1 || currentStep === 3" class="operation-grid">
              <div>
                <span>Mode</span>
                <strong>📷 Capturing</strong>
              </div>

              <div>
                <span>Exposure</span>
                <strong>{{ exposure }} s</strong>
              </div>

              <div>
                <span>Remaining</span>
                <strong>{{ exposureRemaining }}</strong>
              </div>
            </div>

            <div v-else-if="currentStep === 4" class="operation-grid">
              <div>
                <span>Mode</span>
                <strong>🧮 Calculating</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>Comparing Solutions</strong>
              </div>

              <div>
                <span>Progress</span>
                <strong>{{ progress }}%</strong>
              </div>
            </div>

            <div v-else class="operation-grid">
              <div>
                <span>Mode</span>
                <strong><span class="waiting-dot"></span>Waiting</strong>
              </div>

              <div>
                <span>Action</span>
                <strong>Rotate Mount</strong>
              </div>

              <div>
                <span>Rotation</span>
                <strong>{{ rotationAngle }}°</strong>
              </div>
            </div>
          </div>

          <div v-if="currentStep === 5" class="alignment-results">
            <div class="result-box quality-box">
              <span>Status</span>
              <strong>{{ alignmentQuality }}</strong>
            </div>

            <div class="result-box">
              <span>Polar Error</span>
              <strong>{{ polarError }}</strong>
            </div>

            <div class="result-box">
              <span>Altitude</span>
              <strong>{{ altitudeCorrection }}</strong>
            </div>

            <div class="result-box">
              <span>Azimuth</span>
              <strong>{{ azimuthCorrection }}</strong>
            </div>
          </div>
        </div>

        <button class="start-pa-btn" :disabled="isBusy" @click="continueAlignment">
          <span>
            {{
              currentStep === 2
                ? 'Rotation Complete'
                : currentStep === 5
                  ? 'Measure Again'
                  : 'Continue'
            }}
          </span>
          <span class="button-arrow">→</span>
        </button>
      </template>
    </section>
  </main>
</template>

<style scoped>
.pa-page {
  min-height: 100%;
  padding: 28px;
  color: #f4f7fb;
  background:
    radial-gradient(circle at top right, rgba(38, 112, 190, 0.12), transparent 34%), #08111f;
}

.back-button:hover {
  color: #ffffff;
}
.pa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.pa-eyebrow,
.section-label {
  margin: 0 0 6px;
  color: #6fa8e8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.pa-header h1 {
  margin: 0;
  font-size: clamp(28px, 3vw, 38px);
  line-height: 1.1;
}

.pa-subtitle {
  margin: 9px 0 0;
  color: #96a7bc;
  font-size: 15px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 190px;
  padding: 13px 16px;
  border: 1px solid #263a53;
  border-radius: 14px;
  background: #101c2d;
}

.status-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #41d893;
  box-shadow: 0 0 0 5px rgba(65, 216, 147, 0.12);
}

.connection-status div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.connection-status strong {
  font-size: 14px;
}

.connection-status span:last-child {
  color: #7f92aa;
  font-size: 12px;
}

.pa-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.75fr);
  gap: 22px;
  align-items: start;
}

.pa-settings-card,
.pa-preview-card,
.instruction-card {
  border: 1px solid #233750;
  border-radius: 18px;
  background: linear-gradient(145deg, #111d2e, #0d1828);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
}

.pa-settings-card {
  padding: 22px;
}
.pa-settings-card {
  position: relative;
  padding: 22px;
  overflow: hidden;
}

.settings-grid {
  position: relative;
  z-index: 2;
  width: calc(100% - 300px);
}

.mount-illustration {
  position: absolute;
  right: 24px;
  top: 95px;

  width: 360px;

  z-index: 2;
  pointer-events: none;
  user-select: none;
}

.mount-image {
  display: block;
  width: 100%;
  height: auto;
}
.mount-illustration {
  filter: drop-shadow(0 18px 18px rgba(0, 0, 0, 0.38));
}

.mount-stationary,
.mount-ra-assembly {
  filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.3));
}

.scope-body {
  fill: #dfe5eb;
  stroke: #ffffff;
  stroke-width: 2;
}

.scope-front {
  fill: #bfc8d2;
  stroke: #eef3f7;
  stroke-width: 2;
}

.scope-lens {
  fill: #163f70;
  stroke: #69adf4;
  stroke-width: 3;
  filter: drop-shadow(0 0 7px rgba(72, 157, 245, 0.75));
}

.mount-base,
.mount-head {
  fill: #c9342f;
  stroke: #ff746c;
  stroke-width: 2;
}

.mount-head-inner {
  fill: #101a26;
  stroke: #8194aa;
  stroke-width: 3;
}

.ra-arm {
  fill: none;
  stroke: #c9342f;
  stroke-width: 18;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mount-saddle,
.tripod-top {
  fill: #485b70;
  stroke: #9aabba;
  stroke-width: 2;
}

.scope-camera {
  fill: #c9342f;
  stroke: #ff746c;
  stroke-width: 2;
}

.camera-detail {
  fill: #111c28;
  stroke: #8296aa;
  stroke-width: 2;
}

.tripod-leg {
  fill: none;
  stroke: #596a7d;
  stroke-width: 11;
  stroke-linecap: round;
}

.counterweight {
  fill: #1a2939;
  stroke: #71869b;
  stroke-width: 3;
}
.mount-ra-assembly {
  transform-box: view-box;
  transform-origin: 178px 112px;
  transition: transform 2.2s ease-in-out;
}

.mount-shadow {
  fill: rgba(0, 0, 0, 0.3);
}

.tripod-leg {
  fill: none;
  stroke: #69798e;
  stroke-width: 10;
  stroke-linecap: round;
}

.tripod-foot {
  fill: none;
  stroke: #8190a3;
  stroke-width: 7;
  stroke-linecap: round;
}

.tripod-top {
  fill: #53677d;
  stroke: #8fa3b8;
  stroke-width: 2;
}

.mount-base {
  fill: #c43b35;
  stroke: #f06c62;
  stroke-width: 2;
}

.mount-head {
  fill: #d54b43;
  stroke: #ff7b70;
  stroke-width: 3;
}

.mount-head-inner {
  fill: #182739;
  stroke: #718ba8;
  stroke-width: 3;
}

.mount-detail {
  fill: #25384d;
  stroke: #718ba8;
  stroke-width: 2;
}

.ra-arm {
  fill: none;
  stroke: #cf463f;
  stroke-width: 17;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mount-saddle {
  fill: #566b82;
  stroke: #9bacc0;
  stroke-width: 2;
}

.scope-body {
  fill: #e5eaf0;
  stroke: #ffffff;
  stroke-width: 2;
}

.scope-front {
  fill: #cfd7df;
  stroke: #f5f8fb;
  stroke-width: 2;
}

.scope-lens {
  fill: #438ee6;
  stroke: #8fc4ff;
  stroke-width: 3;
}

.scope-focuser {
  fill: #75869a;
  stroke: #aab7c5;
  stroke-width: 2;
}

.scope-camera {
  fill: #c84039;
  stroke: #ff786d;
  stroke-width: 2;
}

.camera-detail {
  fill: #172535;
  stroke: #8095ab;
  stroke-width: 2;
}

.counterweight-shaft {
  fill: none;
  stroke: #8b9bad;
  stroke-width: 6;
  stroke-linecap: round;
}

.counterweight {
  fill: #26394e;
  stroke: #8195aa;
  stroke-width: 3;
}
.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.card-heading h2,
.preview-copy h2,
.instruction-copy h2 {
  margin: 0;
  font-size: 19px;
}

.ready-badge {
  padding: 7px 11px;
  border: 1px solid rgba(65, 216, 147, 0.3);
  border-radius: 999px;
  color: #66e2a5;
  background: rgba(65, 216, 147, 0.08);
  font-size: 12px;
  font-weight: 800;
}

.settings-grid {
  position: relative;
  z-index: 3;

  width: calc(100% - 390px);
}

.setting-field {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.setting-field > span:first-child {
  color: #93a4b9;
  font-size: 13px;
  font-weight: 700;
}

.setting-field input,
.setting-field select,
.readonly-value {
  width: 100%;
  height: 50px;
  border: 1px solid #2a405c;
  border-radius: 12px;
  color: #f4f7fb;
  background: #0a1524;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
}

.setting-field input,
.setting-field select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #28405b;
  background: #08111f;
  color: #fff;
  font-size: 15px;
}

.setting-field select {
  cursor: pointer;
}

.setting-field input:focus,
.setting-field select:focus {
  border-color: #438ee6;
  box-shadow: 0 0 0 3px rgba(67, 142, 230, 0.14);
}

.readonly-value {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
}

.equipment-icon {
  color: #5fa5f2;
  font-size: 17px;
}

.solver-indicator {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #41d893;
}

.input-with-unit {
  position: relative;
}

.input-with-unit input {
  padding-right: 82px;
}

.input-with-unit span {
  position: absolute;
  top: 50%;
  right: 14px;
  color: #72859d;
  font-size: 12px;
  transform: translateY(-50%);
  pointer-events: none;
}

.pa-preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 26px;
  text-align: center;
}
.camera-preview {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 14px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}

.preview-status {
  color: #5de39b;
  font-size: 13px;
}
.preview-stars {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.preview-star {
  position: absolute;
  border-radius: 50%;
  background: #ffffff;

  box-shadow:
    0 0 3px rgba(255, 255, 255, 0.9),
    0 0 8px rgba(140, 190, 255, 0.6);

  animation: twinkle 3s ease-in-out infinite;
}
@keyframes markerPulse {
  0% {
    filter: brightness(0.95);
  }

  50% {
    filter: brightness(1.25);
  }

  100% {
    filter: brightness(0.95);
  }
}
@keyframes twinkle {
  0% {
    opacity: 0.35;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
  }

  100% {
    opacity: 0.35;
    transform: scale(0.9);
  }
}
.preview-window {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  background: radial-gradient(circle at center, #13243c 0%, #09111d 100%);
  border: 1px solid #2b4667;
  overflow: hidden;
}

.preview-crosshair {
  position: absolute;
  background: #2c5f93;
}

.preview-crosshair.horizontal {
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
}

.preview-crosshair.vertical {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
}

.star {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 8px white;
}

.s1 {
  top: 18%;
  left: 25%;
}
.s2 {
  top: 28%;
  left: 60%;
}
.s3 {
  top: 42%;
  left: 40%;
}
.s4 {
  top: 67%;
  left: 20%;
}
.s5 {
  top: 74%;
  left: 70%;
}
.s6 {
  top: 15%;
  left: 78%;
}
.s7 {
  top: 56%;
  left: 82%;
}
.s8 {
  top: 82%;
  left: 48%;
}

.preview-footer {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  margin-top: 16px;
}
.stat-icon {
  width: 34px;
  height: 34px;
  margin-bottom: 8px;
  color: #4d93ff;
  fill: currentColor;
  filter: drop-shadow(0 0 8px rgba(77, 147, 255, 0.3));
}
.preview-footer > div {
  display: grid;
  grid-template-rows: auto auto auto;
  align-items: center;
  justify-items: center;

  min-height: 150px;
  padding: 16px 10px;

  border: 1px solid #2b4667;
  border-radius: 12px;
  background: rgba(8, 20, 35, 0.45);

  box-sizing: border-box;
}
.stat-icon-stars {
  width: 34px;
  height: 34px;
}
.preview-footer small {
  display: block;
  margin-bottom: 8px;
  color: #8fa7c6;
  font-size: 13px;
}

.preview-footer strong {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: white;
}
.pole-preview {
  position: relative;
  width: 190px;
  height: 190px;
  margin-bottom: 24px;
  border: 1px solid #2a405b;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(69, 142, 225, 0.1), transparent 58%), #091522;
  overflow: hidden;
}

.outer-ring,
.middle-ring,
.inner-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid rgba(98, 158, 225, 0.34);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.outer-ring {
  width: 148px;
  height: 148px;
}

.middle-ring {
  width: 98px;
  height: 98px;
}

.inner-ring {
  width: 38px;
  height: 38px;
  border-color: rgba(91, 214, 164, 0.64);
}

.crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  background: rgba(89, 148, 215, 0.4);
  transform: translate(-50%, -50%);
}

.crosshair-horizontal {
  width: 100%;
  height: 1px;
}

.crosshair-vertical {
  width: 1px;
  height: 100%;
}

.alignment-point {
  position: absolute;
  top: 55px;
  right: 49px;
  width: 13px;
  height: 13px;
  border: 3px solid #08111f;
  border-radius: 50%;
  background: #ffbd59;
  box-shadow: 0 0 15px rgba(255, 189, 89, 0.7);
}

.preview-copy p:last-child {
  max-width: 320px;
  margin: 10px auto 0;
  color: #8497af;
  font-size: 14px;
  line-height: 1.55;
}

.instruction-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  margin-top: 22px;
  padding: 20px 22px;
}

.instruction-icon {
  display: grid;
  width: 45px;
  height: 45px;
  place-items: center;
  border: 1px solid #31577f;
  border-radius: 13px;
  color: #78b5f6;
  background: #11263d;
  font-size: 17px;
  font-weight: 900;
}

.instruction-copy p {
  max-width: 770px;
  margin: 7px 0 0;
  color: #899bb1;
  font-size: 14px;
  line-height: 1.5;
}

.start-pa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-width: 230px;
  height: 54px;
  padding: 0 21px;
  border: 1px solid #428de3;
  border-radius: 13px;
  color: #ffffff;
  background: linear-gradient(135deg, #236fc3, #3c8be5);
  cursor: pointer;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 12px 25px rgba(25, 105, 194, 0.25);
}

.start-pa-btn:hover {
  filter: brightness(1.1);
}

.button-arrow {
  font-size: 20px;
}
.alignment-results {
  display: grid;
  grid-template-columns: repeat(4, minmax(130px, 1fr));
  gap: 14px;
  margin-top: 18px;
}
.quality-box {
  border-color: red;
  background: rgba(255, 189, 89, 0.06);
}

.quality-box strong {
  color: #ffbd59;
  font-size: 18px;
}
.result-box {
  padding: 14px 18px;
  border: 1px solid #294566;
  border-radius: 12px;
  background: #0b1626;
}
.result-box.quality-box {
  border: 2px solid #ffbd59;
  background: rgba(69, 47, 16, 0.08);
}
.result-box span {
  display: block;
  margin-bottom: 7px;
  color: #86a0bd;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.result-box strong {
  font-size: 18px;
  line-height: 1.3;
}

.instruction-copy {
  min-width: 0;
}

.alignment-results {
  width: 100%;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
}
.progress-section {
  margin: 18px 0 22px;
}
.workflow-steps {
  margin: 22px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.operation-grid strong {
  display: flex;
  align-items: center;
  gap: 10px;
}

.waiting-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffbd59;
  box-shadow: 0 0 0 5px rgba(255, 189, 89, 0.12);
}
.workflow-step {
  display: flex;
  align-items: center;

  gap: 12px;

  padding: 12px 16px;

  border-radius: 10px;

  background: #0b1626;

  border: 1px solid #253d5b;

  color: #7f94ac;

  transition: 0.25s;
}

.workflow-step span {
  width: 24px;

  text-align: center;

  font-weight: 700;
}
.start-pa-btn:disabled {
  opacity: 0.55;
  cursor: wait;
  filter: none;
}
.workflow-step.active {
  color: #ffffff;

  border-color: #3c8be5;

  background: #10233b;
}

.workflow-step.complete {
  color: #66e2a5;

  border-color: #2b6a4d;

  background: #10261d;
}
.progress-bar {
  width: 100%;
  height: 10px;
  background: #142338;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2d7fe3, #62b0ff);
  border-radius: 999px;
  transition: width 0.35s ease;
}

.progress-text {
  margin-top: 8px;
  color: #8ea5bf;
  font-size: 13px;
  font-weight: 700;
}
.operation-card {
  margin: 20px 0;
  padding: 18px;
  border: 1px solid #294566;
  border-radius: 14px;
  background: #0b1626;
}

.operation-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 14px;
}

.operation-grid span {
  display: block;
  margin-bottom: 6px;
  color: #7d93ad;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.operation-grid strong {
  font-size: 16px;
  color: white;
}
.polar-target {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 0 32px;
}
.preview-polar-target {
  z-index: 1;
}

.preview-polar-target .target-north {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;

  z-index: 20;
}

.north-letter {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;

  color: #9ec6ff;

  text-shadow:
    0 0 4px rgba(120, 170, 255, 0.6),
    0 0 10px rgba(120, 170, 255, 0.25);
}

.north-arrow {
  width: 0;
  height: 0;

  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 8px solid #9ec6ff;
}

.preview-polar-target .polar-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(82%, 260px);
  height: auto;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
}

.preview-polar-target .ring1 {
  width: 100%;
  height: 100%;
}
.alignment-preview-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alignment-preview-status > div {
  display: flex;
  flex-direction: column;
}

.preview-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #41d893;
  box-shadow: 0 0 8px rgba(65, 216, 147, 0.5);
}

.preview-status-dot.working {
  background: #5fa5f2;
}

.preview-status-dot.aligned {
  background: #41d893;
  box-shadow: 0 0 12px rgba(65, 216, 147, 0.8);
}
.preview-polar-target .ring2 {
  width: 77%;
  height: 77%;
}

.preview-polar-target .ring3 {
  width: 54%;
  height: 54%;
}

.preview-polar-target .ring4 {
  width: 31%;
  height: 31%;
}
.target-north {
  color: #8bb8ff;
  font-weight: 700;
  letter-spacing: 2px;
}

.polar-circle {
  position: relative;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  overflow: visible;

  border: 1px solid rgba(92, 142, 194, 0.45);
  background: radial-gradient(circle, rgba(19, 36, 60, 0.3) 0%, rgba(8, 17, 31, 0.12) 100%);

  box-shadow: inset 0 0 30px rgba(70, 130, 200, 0.08);
}

.ring {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  border: 1px solid rgba(100, 160, 230, 0.32);
  border-radius: 50%;
}

.ring1 {
  width: 260px;
  height: 260px;
}
.ring2 {
  width: 200px;
  height: 200px;
}
.ring3 {
  width: 140px;
  height: 140px;
}
.ring4 {
  width: 80px;
  height: 80px;
}

.crosshair {
  background: rgba(125, 185, 255, 0.28);
}

.crosshair.horizontal {
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  transform: translateY(-50%);
}

.crosshair.vertical {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  transform: translateX(-50%);
}

.bullseye {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20px;
  height: 20px;

  border: 3px solid #47df89;
  border-radius: 50%;

  transform: translate(-50%, -50%);

  box-shadow:
    0 0 2px rgba(255, 255, 255, 0.9),
    0 0 5px rgba(121, 183, 255, 0.45);
}

.current-position {
  position: absolute;
  left: 50%;
  top: 50%;

  width: 18px;
  height: 18px;

  border-radius: 50%;
  border: 3px solid #08111f;

  background: radial-gradient(circle at 35% 35%, #ffd27c, #ff9800);

  transform-origin: center;

  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.35s ease,
    box-shadow 0.35s ease;

  box-shadow:
    0 0 8px rgba(255, 170, 0, 0.9),
    0 0 20px rgba(255, 170, 0, 0.35);

  z-index: 5;
  animation: markerPulse 1.8s ease-in-out infinite;
}
.setting-field input:disabled,
.setting-field select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: #08111f;
}
.error-badge {
  position: absolute;
  left: 31px;
  top: 50%;

  display: flex;
  align-items: center;
  gap: 7px;

  transform: translateY(-50%);

  padding: 7px 11px;
  border: 1px solid rgba(255, 189, 89, 0.5);
  border-radius: 9px;

  color: #ffffff;
  background: linear-gradient(135deg, rgba(32, 39, 51, 0.96), rgba(12, 23, 39, 0.96));

  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  white-space: nowrap;

  box-shadow:
    0 7px 18px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);

  backdrop-filter: blur(10px);
  z-index: 10;
}

.error-badge::before {
  content: '';
  width: 7px;
  height: 7px;
  flex-shrink: 0;

  border-radius: 50%;
  background: #ffbd59;

  box-shadow:
    0 0 0 3px rgba(255, 189, 89, 0.12),
    0 0 8px rgba(255, 189, 89, 0.65);
}
.current-position.aligned .error-badge {
  border-color: rgba(71, 223, 137, 0.55);
}

.current-position.aligned .error-badge::before {
  background: #47df89;

  box-shadow:
    0 0 0 3px rgba(71, 223, 137, 0.14),
    0 0 8px rgba(71, 223, 137, 0.7);
}
to {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

@media (max-width: 980px) {
  .pa-layout {
    grid-template-columns: 1fr;
    .settings-grid {
      width: calc(100% - 250px);
    }

    .mount-illustration {
      width: 235px;
    }
  }

  .instruction-card {
    grid-template-columns: auto 1fr;
  }

  .start-pa-btn {
    grid-column: 1 / -1;
    width: 100%;
  }
}

@media (max-width: 650px) {
  .pa-settings-card {
    min-height: auto;
  }

  .settings-grid {
    width: 100%;
  }

  .mount-illustration {
    position: relative;
    right: auto;
    bottom: auto;
    width: min(100%, 280px);
    margin: 24px auto 0;
  }
  .pa-page {
    padding: 18px;
  }
  .target-instruction {
    max-width: 420px;
    margin: 16px 0 0;
    color: #8ea5bf;
    font-size: 14px;
    line-height: 1.5;
    text-align: center;
  }
  .pa-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .connection-status {
    width: 100%;
    box-sizing: border-box;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .instruction-card {
    grid-template-columns: 1fr;
  }

  .instruction-icon {
    display: none;
  }

  .start-pa-btn {
    min-width: 0;
  }
  .polar-circle {
    width: 210px;
    height: 210px;
  }

  .ring1 {
    width: 210px;
    height: 210px;
  }

  .ring2 {
    width: 160px;
    height: 160px;
  }

  .ring3 {
    width: 110px;
    height: 110px;
  }

  .ring4 {
    width: 60px;
    height: 60px;
  }
  .reticle-ticks {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
  }

  .reticle-ticks span {
    position: absolute;
    top: 2px;
    left: 50%;

    width: 2px;
    height: 14px;

    background: #79b7ff;
    border-radius: 2px;

    transform-origin: 50% 128px;

    box-shadow: 0 0 6px rgba(121, 183, 255, 0.75);
  }
  .mount-illustration .scope-body {
    fill: #ffffff;
    stroke: #38bdf8;
    stroke-width: 4;
  }

  .mount-illustration .mount-base,
  .mount-illustration .mount-head,
  .mount-illustration .ra-arm,
  .mount-illustration .scope-camera {
    fill: #ef2b2d;
    stroke: #ffaaa8;
    stroke-width: 3;
  }

  .mount-illustration .scope-lens {
    fill: #00b7ff;
    stroke: #b9ecff;
    stroke-width: 4;
  }

  .mount-illustration .tripod-leg {
    stroke: #a7b6c8;
    stroke-width: 14;
  }
  .mount-ra-assembly {
    transform-box: view-box;
    transform-origin: 184px 134px;
    transition: transform 2.2s ease-in-out;
  }
  .mount-illustration {
    position: absolute;
    right: 32px;
    top: 175px;
    bottom: 90px;
    width: 500px;

    display: flex;
    align-items: flex-end;
    justify-content: center;

    pointer-events: none;
    user-select: none;
    z-index: 2;
  }

  .mount-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center bottom;

    filter: drop-shadow(0 18px 22px rgba(0, 0, 0, 0.4));
  }

  .settings-grid {
    position: relative;
    z-index: 3;
    width: calc(100% - 530px);
  }
  .mount-illustration {
    position: absolute;
    right: 34px;
    top: 170px;
    bottom: 88px;
    width: 500px;

    display: flex;
    align-items: flex-end;
    justify-content: center;

    pointer-events: none;
    user-select: none;
    z-index: 2;
  }

  .mount-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center bottom;

    filter: drop-shadow(0 18px 22px rgba(0, 0, 0, 0.4));
  }

  .settings-grid {
    position: relative;
    z-index: 3;
    width: calc(100% - 530px);
  }

  .pa-settings-card {
    position: relative;
    overflow: hidden;
  }
}
</style>

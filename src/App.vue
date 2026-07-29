<script setup>
import { computed, ref } from 'vue';

// --- App & Equipment State ---
const appTitle = ref('AstroAlign');
const appVersion = ref('v3.2.0');
const isBusy = ref(false);
const isAutoRefreshing = ref(true);
const statusMessage = ref('Target Solved - Ready for Adjustment');

// Connected Devices Telemetry
const cameraModel = ref('Primary CMOS Camera');
const resolution = ref('5496 x 3672');
const gain = ref(53);
const sensorTemp = ref(0.5);
const coolerPower = ref(33);
const expTime = ref(2.0);

// Polar Axis Adjustment Offsets (Arc-seconds)
const altOffsetSeconds = ref(27); // +: Down / -: Up
const azOffsetSeconds = ref(7);   // +: Left / -: Right

// Computed Total Error Vector
const totalErrorSeconds = computed(() => {
  return Math.round(Math.hypot(altOffsetSeconds.value, azOffsetSeconds.value));
});

// Converts Arc-seconds into standard Astronomical DMS notation
function formatAngle(totalSec) {
  const absSec = Math.round(Math.abs(totalSec));
  const deg = Math.floor(absSec / 3600);
  const min = Math.floor((absSec % 3600) / 60);
  const sec = absSec % 60;

  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(deg)}° ${pad(min)}' ${pad(sec)}"`;
}

// Map offset values to Scope Reticle Coordinates
const raTargetStyle = computed(() => {
  const scale = 2.2;
  const translateX = azOffsetSeconds.value * scale;
  const translateY = altOffsetSeconds.value * scale;

  return {
    transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px))`,
  };
});

// Alignment Threshold Status
const qualityStatus = computed(() => {
  if (totalErrorSeconds.value <= 15) return { icon: '🎯', label: 'EXCELLENT', color: '#10b981', badgeClass: 'good' };
  if (totalErrorSeconds.value <= 45) return { icon: '⚠️', label: 'ACCEPTABLE', color: '#f59e0b', badgeClass: 'warn' };
  return { icon: '🚨', label: 'POOR ALIGNMENT', color: '#ef4444', badgeClass: 'poor' };
});

function handleRefresh() {
  if (isBusy.value) return;
  isBusy.value = true;
  statusMessage.value = 'Exposing & Solving Field...';

  setTimeout(() => {
    if (altOffsetSeconds.value > 2) altOffsetSeconds.value = Math.max(0, altOffsetSeconds.value - Math.floor(Math.random() * 8 + 3));
    if (azOffsetSeconds.value > 1) azOffsetSeconds.value = Math.max(0, azOffsetSeconds.value - Math.floor(Math.random() * 3 + 1));

    statusMessage.value = 'Plate Solve Complete';
    isBusy.value = false;
  }, 1100);
}

function handleFinish() {
  statusMessage.value = 'Polar Alignment Locked';
}
</script>

<template>
  <div class="align-shell">
    <!-- Top Navigation Header -->
    <header class="top-nav">
      <div class="brand-group">
        <span class="brand-title">{{ appTitle }}</span>
        <span class="brand-ver">{{ appVersion }}</span>
        <div class="battery-status" title="System Battery">
          <div class="battery-pill"><div class="battery-fill" style="width: 100%"></div></div>
          <span>100%</span>
        </div>
      </div>

      <div class="device-toolbar">
        <button class="tool-btn active" title="Wi-Fi Link">📶 LINK</button>
        <button class="tool-btn active" title="Main Imaging Camera">📷 CAM</button>
        <button class="tool-btn active" title="Guiding Camera">🎯 GUIDE</button>
        <button class="tool-btn active" title="Equatorial Mount">🔭 MOUNT</button>
        <button class="tool-btn active" title="Electronic Focuser">🔍 EAF</button>
        <button class="tool-btn active" title="Power Hub">⚡ PWR</button>
      </div>
    </header>

    <!-- Main Workspace Area -->
    <main class="deck-body">
      <!-- Left Sidebar: Workflow & Mount Orientation -->
      <aside class="panel-left">
        <div class="panel-section">
          <div class="panel-title">WORKFLOW</div>
          <div class="stepper-vertical">
            <div class="step-item completed">
              <div class="step-node">✓</div>
              <div class="step-text">
                <span class="step-num">STEP 1</span>
                <span class="step-name">Calibrate</span>
              </div>
            </div>
            <div class="step-line completed"></div>

            <div class="step-item completed">
              <div class="step-node">✓</div>
              <div class="step-text">
                <span class="step-num">STEP 2</span>
                <span class="step-name">Rotate Axis</span>
              </div>
            </div>
            <div class="step-line completed"></div>

            <div class="step-item active">
              <div class="step-node">3</div>
              <div class="step-text">
                <span class="step-num">STEP 3</span>
                <span class="step-name">Adjust Knobs</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-section mount-section">
          <div class="mount-schema-card">
            <div class="schema-title">MOUNT ORIENTATION</div>
            <svg class="mount-svg" viewBox="0 0 120 85" fill="none">
              <path d="M60 60 L38 82 M60 60 L60 85 M60 60 L82 82" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
              <polygon points="46,60 74,60 67,45 53,45" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
              <circle cx="60" cy="34" r="10" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
              <line x1="51" y1="41" x2="35" y2="53" stroke="#64748b" stroke-width="2"/>
              <circle cx="35" cy="53" r="3" fill="#94a3b8"/>
              <g transform="rotate(-30 60 22)">
                <rect x="45" y="6" width="30" height="26" rx="2" fill="#1e293b" stroke="#00f2fe" stroke-width="1.5"/>
              </g>
              <path d="M 78 22 C 88 22, 88 42, 78 42" stroke="#10b981" stroke-width="1.2" stroke-dasharray="2 2" fill="none"/>
              <polygon points="78,20 82,24 74,24" fill="#10b981"/>
              <text x="90" y="29" fill="#10b981" font-size="9" font-weight="bold">ALT</text>
              <text x="90" y="40" fill="#38bdf8" font-size="9" font-weight="bold">AZ</text>
            </svg>
          </div>
        </div>

        <div class="reticle-legend">
          <div class="legend-item"><span class="dot green"></span> True Pole (NCP)</div>
          <div class="legend-item"><span class="dot yellow"></span> Mount RA Axis</div>
        </div>
      </aside>

      <!-- Center Reticle Viewport -->
      <section class="panel-center">
        <!-- SVG Scope -->
        <div class="reticle-container">
          <svg class="scope-svg" viewBox="0 0 360 360">
            <defs>
              <radialGradient id="reticleGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#0284c7" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
              </radialGradient>
            </defs>

            <!-- Background Outer Field -->
            <circle cx="180" cy="180" r="130" fill="url(#reticleGlow)" stroke="#1e293b" stroke-width="1.5"/>

            <!-- Axis Crosshairs -->
            <line x1="180" y1="30" x2="180" y2="330" stroke="#334155" stroke-width="1" stroke-dasharray="6 4"/>
            <line x1="30" y1="180" x2="330" y2="180" stroke="#334155" stroke-width="1" stroke-dasharray="6 4"/>

            <!-- Concentric Reticle Rings -->
            <circle cx="180" cy="180" r="130" stroke="#334155" stroke-width="1.5" fill="none"/>
            <circle cx="180" cy="180" r="85" stroke="#1e293b" stroke-width="1" stroke-dasharray="3 3" fill="none"/>
            <circle cx="180" cy="180" r="42" stroke="#334155" stroke-width="1" fill="none"/>
            <circle cx="180" cy="180" r="15" stroke="#10b981" stroke-width="1" stroke-opacity="0.4" fill="none"/>

            <!-- Angular Distance Callouts -->
            <text x="226" y="174" fill="#64748b" font-size="9" font-family="monospace">3'</text>
            <text x="270" y="174" fill="#64748b" font-size="9" font-family="monospace">5'</text>

            <!-- Directional Labels (Tightened inward to avoid any clipping) -->
            <text x="180" y="22" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">UP (ALT -)</text>
            <text x="180" y="344" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">DOWN (ALT +)</text>
            <text x="12" y="183" fill="#38bdf8" font-size="10" font-weight="bold">RIGHT (AZ -)</text>
            <text x="348" y="183" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="end">LEFT (AZ +)</text>

            <!-- Fixed True Celestial Pole Center Target (Green) -->
            <g transform="translate(180, 180)">
              <circle cx="0" cy="0" r="3.5" fill="#10b981"/>
              <circle cx="0" cy="0" r="8" stroke="#10b981" stroke-width="1.5" fill="none"/>
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#10b981" stroke-width="1"/>
              <line x1="0" y1="-12" x2="0" y2="12" stroke="#10b981" stroke-width="1"/>
            </g>
          </svg>

          <!-- Dynamic RA Target Marker -->
          <div class="ra-target-marker" :style="raTargetStyle">
            <div class="target-ring"></div>
            <span class="target-readout">{{ formatAngle(totalErrorSeconds) }}</span>
          </div>
        </div>

        <!-- Solver Status Toast (Moved OUTSIDE reticle-container so it never overlaps SVG text) -->
        <div class="status-toast" :class="{ busy: isBusy }">
          <span class="status-dot"></span>
          <span>{{ statusMessage }}</span>
        </div>
      </section>

      <!-- Right Sidebar: Metrics & Action Dock -->
      <aside class="panel-right">
        <div class="panel-title">ALIGNMENT METRICS</div>

        <!-- Status Card -->
        <div class="quality-card" :class="qualityStatus.badgeClass">
          <span class="quality-icon">{{ qualityStatus.icon }}</span>
          <div class="quality-info">
            <span class="quality-title">STATUS</span>
            <span class="quality-value" :style="{ color: qualityStatus.color }">{{ qualityStatus.label }}</span>
          </div>
        </div>

        <!-- Correction Vectors -->
        <div class="vectors-card">
          <div class="vector-title">CORRECTION KNOBS</div>

          <div class="vector-row">
            <div class="axis-tag">
              <span class="axis-label">ALTITUDE</span>
              <span class="axis-sub">(Alt Knob)</span>
            </div>
            <div class="vector-value-box">
              <span class="arrow down">↓ Turn Down</span>
              <span class="angle">{{ formatAngle(altOffsetSeconds) }}</span>
            </div>
          </div>

          <div class="vector-row">
            <div class="axis-tag">
              <span class="axis-label">AZIMUTH</span>
              <span class="axis-sub">(Az Knob)</span>
            </div>
            <div class="vector-value-box">
              <span class="arrow left">← Turn Left</span>
              <span class="angle">{{ formatAngle(azOffsetSeconds) }}</span>
            </div>
          </div>
        </div>

        <!-- Total Polar Error Display -->
        <div class="total-error-box">
          <span class="error-heading">TOTAL POLAR ERROR</span>
          <span class="error-value" :style="{ color: qualityStatus.color }">
            {{ formatAngle(totalErrorSeconds) }}
          </span>
          <span class="error-raw">({{ totalErrorSeconds }} Arcseconds)</span>
        </div>

        <!-- Spacer pushes control dock nicely to bottom -->
        <div class="panel-spacer"></div>

        <!-- Execution Control Dock -->
        <div class="control-dock">
          <div class="dock-row">
            <div class="shutter-wrapper">
              <button class="shutter-trigger" :class="{ busy: isBusy }" @click="handleRefresh" title="Capture & Solve">
                <span class="shutter-core"></span>
              </button>
              <div class="exp-setting">
                <span class="exp-title">EXP</span>
                <span class="exp-time">{{ expTime }}s</span>
              </div>
            </div>

            <button class="btn btn-refresh" :disabled="isBusy" @click="handleRefresh">
              {{ isBusy ? 'Solving...' : 'Refresh' }}
            </button>
          </div>

          <button class="btn btn-finish" @click="handleFinish">Lock & Finish</button>

          <label class="auto-check">
            <input v-model="isAutoRefreshing" type="checkbox" />
            <span>Auto Loop</span>
          </label>
        </div>
      </aside>
    </main>

    <!-- Bottom Telemetry Bar -->
    <footer class="bottom-bar">
      <div class="telemetry-group">
        <div class="tel-item"><span class="tel-key">CAM:</span> <span class="tel-val">{{ cameraModel }}</span></div>
        <div class="tel-item"><span class="tel-key">RES:</span> <span class="tel-val">{{ resolution }}</span></div>
        <div class="tel-item"><span class="tel-key">GAIN:</span> <span class="tel-val">{{ gain }}</span></div>
        <div class="tel-item"><span class="tel-key">TEMP:</span> <span class="tel-val">{{ sensorTemp }}°C</span></div>
        <div class="tel-item"><span class="tel-key">COOL:</span> <span class="tel-val">{{ coolerPower }}%</span></div>
      </div>
      <div class="system-time">UTC 22:47:04</div>
    </footer>
  </div>
</template>

<style>
/* 
  Global Override: Nuke all browser margins, paddings, and bounds.
  This breaks Vite's default CSS caching and forces the window to clear scrollbars.
*/
html, body, #app {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  background-color: #020617;
}

body > div {
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
  overflow: hidden !important;
}
</style>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box !important;
}

/* 
  Jailbreak the Shell: position: fixed; inset: 0; forces this app to 
  bind precisely to the screen edges, completely ignoring any parent div limits.
*/
.align-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: #020617;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  user-select: none;
  z-index: 9999;
}

/* Header */
.top-nav {
  height: 38px;
  background: #090d16;
  border-bottom: 1px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  flex-shrink: 0;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-title {
  color: #38bdf8;
  font-weight: 800;
  font-size: 14px;
}

.brand-ver {
  color: #64748b;
  font-size: 10px;
}

.battery-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #10b981;
  font-weight: 700;
}

.battery-pill {
  width: 14px;
  height: 7px;
  border: 1px solid #10b981;
  border-radius: 2px;
  padding: 1px;
}

.battery-fill {
  height: 100%;
  background: #10b981;
}

.device-toolbar {
  display: flex;
  gap: 4px;
}

.tool-btn {
  background: #0f172a;
  border: 1px solid #1e293b;
  color: #38bdf8;
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

/* Workspace Grid Layout */
.deck-body {
  flex: 1;
  display: grid;
  grid-template-columns: 210px 1fr 250px;
  min-height: 0;
  min-width: 0;
  background: #020617;
  overflow: hidden;
}

.panel-title {
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.08em;
  padding-bottom: 4px;
  border-bottom: 1px solid #1e293b;
  margin-bottom: 8px;
  flex-shrink: 0;
}

/* Left Sidebar */
.panel-left {
  background: #090d16;
  border-right: 1px solid #1e293b;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  overflow: hidden;
}

.stepper-vertical {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-node {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #475569;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

.step-item.completed .step-node {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.step-item.active .step-node {
  border-color: #38bdf8;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
}

.step-text {
  display: flex;
  flex-direction: column;
}

.step-num { font-size: 7px; color: #64748b; font-weight: 700; }
.step-name { font-size: 11px; color: #cbd5e1; font-weight: 600; }

.step-line {
  width: 1px;
  height: 8px;
  background: #334155;
  margin-left: 8px;
}
.step-line.completed { background: #10b981; }

.mount-schema-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.schema-title {
  font-size: 8px;
  color: #64748b;
  font-weight: 700;
  margin-bottom: 2px;
}

.mount-svg { width: 110px; height: 75px; }

.reticle-legend {
  font-size: 10px;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-item { display: flex; align-items: center; gap: 6px; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.dot.green { background: #10b981; }
.dot.yellow { background: #f59e0b; }

/* Center Panel Viewport */
.panel-center {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.reticle-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: min(100%, 64vh); 
  max-height: min(100%, 64vh);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scope-svg { 
  width: 100%; 
  height: 100%; 
}

.ra-target-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.target-ring {
  width: 18px;
  height: 18px;
  border: 2px solid #f59e0b;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
}

.target-readout {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: #f59e0b;
  font-family: monospace;
  font-weight: 700;
  white-space: nowrap;
  background: rgba(2, 6, 23, 0.9);
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

/* Toast is now pinned to the bottom of the column, far away from SVG text */
.status-toast {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid #10b981;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 11px;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  white-space: nowrap;
}

.status-toast.busy { border-color: #f59e0b; color: #f59e0b; }
.status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

/* Right Sidebar */
.panel-right {
  background: #090d16;
  border-left: 1px solid #1e293b;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.quality-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 6px 10px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.quality-icon { font-size: 18px; }
.quality-info { display: flex; flex-direction: column; }
.quality-title { font-size: 8px; color: #64748b; font-weight: 800; }
.quality-value { font-size: 11px; font-weight: 800; }

.vectors-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.vector-title { font-size: 9px; color: #64748b; font-weight: 700; }

.vector-row {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 5px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.axis-tag { display: flex; flex-direction: column; }
.axis-label { font-size: 9px; font-weight: 700; color: #f8fafc; }
.axis-sub { font-size: 7px; color: #64748b; }

.vector-value-box { display: flex; flex-direction: column; align-items: flex-end; }
.arrow { font-size: 8px; color: #38bdf8; font-weight: 700; }
.angle { font-family: monospace; font-size: 11px; font-weight: 700; color: #10b981; }

.total-error-box {
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.error-heading { font-size: 8px; color: #64748b; font-weight: 800; }
.error-value { font-family: monospace; font-size: 15px; font-weight: 900; }
.error-raw { font-size: 8px; color: #475569; }

.panel-spacer {
  flex: 1;
}

/* Control Dock */
.control-dock {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.dock-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  align-items: center;
}

.shutter-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 3px 6px;
}

.shutter-trigger {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.shutter-core { width: 14px; height: 14px; border-radius: 50%; background: #ef4444; }

.exp-setting { display: flex; flex-direction: column; }
.exp-title { font-size: 7px; color: #64748b; font-weight: 800; }
.exp-time { font-size: 10px; font-weight: 700; color: #f8fafc; }

.btn {
  height: 30px;
  border-radius: 4px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #f8fafc;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
}

.btn-finish { border-color: #059669; background: #064e3b; color: #34d399; }
.btn-refresh { border-color: #0284c7; background: #0c4a6e; color: #38bdf8; height: 30px; }

.auto-check {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 9px;
  color: #94a3b8;
  cursor: pointer;
}

/* Footer Telemetry Bar */
.bottom-bar {
  height: 22px;
  background: #020617;
  border-top: 1px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 9px;
  color: #64748b;
  font-family: monospace;
  flex-shrink: 0;
}

.telemetry-group { display: flex; gap: 12px; }
.tel-item { display: flex; gap: 3px; }
.tel-key { color: #475569; }
.tel-val { color: #94a3b8; font-weight: 600; }
</style>
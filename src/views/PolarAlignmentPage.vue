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
  const scale = 1.6;
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

        <div class="panel-section">
          <div class="mount-schema-card">
            <div class="schema-title">MOUNT ORIENTATION</div>
            <svg class="mount-svg" viewBox="0 0 120 70" fill="none">
              <path d="M60 50 L40 68 M60 50 L60 70 M60 50 L80 68" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
              <polygon points="48,50 72,50 66,38 54,38" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
              <circle cx="60" cy="28" r="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
              <line x1="52" y1="34" x2="38" y2="44" stroke="#64748b" stroke-width="2"/>
              <circle cx="38" cy="44" r="2.5" fill="#94a3b8"/>
              <g transform="rotate(-30 60 18)">
                <rect x="47" y="4" width="26" height="22" rx="2" fill="#1e293b" stroke="#00f2fe" stroke-width="1.5"/>
              </g>
              <path d="M 76 18 C 84 18, 84 36, 76 36" stroke="#10b981" stroke-width="1.2" stroke-dasharray="2 2" fill="none"/>
              <polygon points="76,16 80,20 72,20" fill="#10b981"/>
              <text x="86" y="24" fill="#10b981" font-size="8" font-weight="bold">ALT</text>
              <text x="86" y="34" fill="#38bdf8" font-size="8" font-weight="bold">AZ</text>
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
        <div class="reticle-container">
          <svg class="scope-svg" viewBox="0 0 320 320">
            <defs>
              <radialGradient id="reticleGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#0284c7" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
              </radialGradient>
            </defs>

            <!-- Background Outer Field -->
            <circle cx="160" cy="160" r="100" fill="url(#reticleGlow)" stroke="#1e293b" stroke-width="1.5"/>

            <!-- Axis Crosshairs -->
            <line x1="160" y1="32" x2="160" y2="288" stroke="#334155" stroke-width="1" stroke-dasharray="6 4"/>
            <line x1="32" y1="160" x2="288" y2="160" stroke="#334155" stroke-width="1" stroke-dasharray="6 4"/>

            <!-- Concentric Reticle Rings -->
            <circle cx="160" cy="160" r="100" stroke="#334155" stroke-width="1.5" fill="none"/>
            <circle cx="160" cy="160" r="66" stroke="#1e293b" stroke-width="1" stroke-dasharray="3 3" fill="none"/>
            <circle cx="160" cy="160" r="33" stroke="#334155" stroke-width="1" fill="none"/>
            <circle cx="160" cy="160" r="12" stroke="#10b981" stroke-width="1" stroke-opacity="0.4" fill="none"/>

            <!-- Angular Distance Callouts -->
            <text x="196" y="154" fill="#64748b" font-size="8" font-family="monospace">3'</text>
            <text x="230" y="154" fill="#64748b" font-size="8" font-family="monospace">5'</text>

            <!-- Directional Labels -->
            <text x="160" y="20" fill="#38bdf8" font-size="9" font-weight="bold" text-anchor="middle">UP (ALT -)</text>
            <text x="160" y="280" fill="#38bdf8" font-size="9" font-weight="bold" text-anchor="middle">DOWN (ALT +)</text>
            <text x="4" y="163" fill="#38bdf8" font-size="8" font-weight="bold">RIGHT (AZ -)</text>
            <text x="316" y="163" fill="#38bdf8" font-size="8" font-weight="bold" text-anchor="end">LEFT (AZ +)</text>

            <!-- Fixed True Celestial Pole Center Target (Green) -->
            <g transform="translate(160, 160)">
              <circle cx="0" cy="0" r="3" fill="#10b981"/>
              <circle cx="0" cy="0" r="7" stroke="#10b981" stroke-width="1.5" fill="none"/>
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#10b981" stroke-width="0.8"/>
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#10b981" stroke-width="0.8"/>
            </g>
          </svg>

          <!-- Dynamic RA Target Marker -->
          <div class="ra-target-marker" :style="raTargetStyle">
            <div class="target-ring"></div>
            <span class="target-readout">{{ formatAngle(totalErrorSeconds) }}</span>
          </div>

          <!-- Solver Status Toast -->
          <div class="status-toast" :class="{ busy: isBusy }">
            <span class="status-dot"></span>
            <span>{{ statusMessage }}</span>
          </div>
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

<style scoped>
*, *::before, *::after {
  box-sizing: border-box !important;
}

.align-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: #020617;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  user-select: none;
}

.top-nav {
  height: 32px;
  background: #090d16;
  border-bottom: 1px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  flex-shrink: 0;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-title {
  color: #38bdf8;
  font-weight: 800;
  font-size: 12px;
}

.brand-ver {
  color: #64748b;
  font-size: 9px;
}

.battery-status {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  color: #10b981;
  font-weight: 700;
}

.battery-pill {
  width: 12px;
  height: 6px;
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
  gap: 3px;
}

.tool-btn {
  background: #0f172a;
  border: 1px solid #1e293b;
  color: #38bdf8;
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
}

.deck-body {
  flex: 1;
  display: grid;
  grid-template-columns: 160px 1fr 180px;
  min-height: 0;
  min-width: 0;
  background: #020617;
  overflow: hidden;
}

.panel-title {
  font-size: 8px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.08em;
  padding-bottom: 2px;
  border-bottom: 1px solid #1e293b;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.panel-left {
  background: #090d16;
  border-right: 1px solid #1e293b;
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  overflow: hidden;
}

.stepper-vertical {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.step-node {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #475569;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
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

.step-num { font-size: 6px; color: #64748b; font-weight: 700; }
.step-name { font-size: 8px; color: #cbd5e1; font-weight: 600; }

.step-line {
  width: 1px;
  height: 4px;
  background: #334155;
  margin-left: 6px;
}
.step-line.completed { background: #10b981; }

.mount-schema-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.schema-title {
  font-size: 7px;
  color: #64748b;
  font-weight: 700;
}

.mount-svg { width: 80px; height: 50px; }

.reticle-legend {
  font-size: 8px;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.legend-item { display: flex; align-items: center; gap: 4px; }
.dot { width: 4px; height: 4px; border-radius: 50%; }
.dot.green { background: #10b981; }
.dot.yellow { background: #f59e0b; }

.panel-center {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.reticle-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: min(100%, 42vh);
  max-height: min(100%, 48vh);
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
  width: 18px;
  height: 18px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.target-ring {
  width: 14px;
  height: 14px;
  border: 1.5px solid #f59e0b;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
}

.target-readout {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  color: #f59e0b;
  font-family: monospace;
  font-weight: 700;
  white-space: nowrap;
  background: rgba(2, 6, 23, 0.9);
  padding: 1px 3px;
  border-radius: 2px;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.status-toast {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid #10b981;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 8px;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  white-space: nowrap;
}

.status-toast.busy { border-color: #f59e0b; color: #f59e0b; }
.status-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }

.panel-right {
  background: #090d16;
  border-left: 1px solid #1e293b;
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  overflow: hidden;
}

.quality-card {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 3px 4px;
  flex-shrink: 0;
}

.quality-icon { font-size: 14px; }
.quality-info { display: flex; flex-direction: column; }
.quality-title { font-size: 6px; color: #64748b; font-weight: 800; }
.quality-value { font-size: 8px; font-weight: 800; }

.vectors-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.vector-title { font-size: 7px; color: #64748b; font-weight: 700; }

.vector-row {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 2px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.axis-tag { display: flex; flex-direction: column; }
.axis-label { font-size: 8px; font-weight: 700; color: #f8fafc; }
.axis-sub { font-size: 6px; color: #64748b; }

.vector-value-box { display: flex; flex-direction: column; align-items: flex-end; }
.arrow { font-size: 7px; color: #38bdf8; font-weight: 700; }
.angle { font-family: monospace; font-size: 9px; font-weight: 700; color: #10b981; }

.total-error-box {
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.error-heading { font-size: 7px; color: #64748b; font-weight: 800; }
.error-value { font-family: monospace; font-size: 12px; font-weight: 900; }
.error-raw { font-size: 6px; color: #475569; }

.control-dock {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
}

.dock-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  align-items: center;
}

.shutter-wrapper {
  display: flex;
  align-items: center;
  gap: 3px;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 2px 3px;
}

.shutter-trigger {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.shutter-core { width: 10px; height: 10px; border-radius: 50%; background: #ef4444; }

.exp-setting { display: flex; flex-direction: column; }
.exp-title { font-size: 5px; color: #64748b; font-weight: 800; }
.exp-time { font-size: 8px; font-weight: 700; color: #f8fafc; }

.btn {
  height: 22px;
  border-radius: 3px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #f8fafc;
  font-size: 8px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
}

.btn-finish { border-color: #059669; background: #064e3b; color: #34d399; }
.btn-refresh { border-color: #0284c7; background: #0c4a6e; color: #38bdf8; height: 22px; }

.auto-check {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  font-size: 8px;
  color: #94a3b8;
  cursor: pointer;
}

.bottom-bar {
  height: 18px;
  background: #020617;
  border-top: 1px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  font-size: 8px;
  color: #64748b;
  font-family: monospace;
  flex-shrink: 0;
}

.telemetry-group { display: flex; gap: 8px; }
.tel-item { display: flex; gap: 2px; }
.tel-key { color: #475569; }
.tel-val { color: #94a3b8; font-weight: 600; }
</style>
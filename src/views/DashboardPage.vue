<template>
  <div class="dashboard">
    <aside class="side-nav">
      <div class="logo">TNS</div>

      <button class="nav-btn active">
        <span class="nav-icon">🔭</span>
        <span>Preview</span>
      </button>

      <button class="nav-btn">
        <span class="nav-icon">🎯</span>
        <span>Focus</span>
      </button>

      <button class="nav-btn">
        <span class="nav-icon">🧭</span>
        <span>PA</span>
      </button>

      <button class="nav-btn">
        <span class="nav-icon">⭐</span>
        <span>Guide</span>
      </button>

      <button class="nav-btn">
        <span class="nav-icon">📋</span>
        <span>Plan</span>
      </button>

      <button class="nav-btn">
        <span class="nav-icon">📁</span>
        <span>Files</span>
      </button>

      <button class="nav-btn">
        <span class="nav-icon">⚙️</span>
        <span>Settings</span>
      </button>
    </aside>

    <main class="main-area">
      <section class="top-status-bar">
        <div class="session-title">🌌 M31 Summer Project</div>

        <div class="top-status-items">
          <span class="status-running">🟢 Imaging</span>
          <span>Frame 38 / 100</span>
          <span>ETA 03:18</span>
          <span>22:37</span>
        </div>
      </section>

      <section class="preview-panel">
        <div class="preview-header">
          <span>Live Preview</span>
          <span class="status-dot">● Connected</span>
        </div>

        <div class="image-placeholder">
          <div class="preview-overlay">
            <img
              class="preview-image"
              src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600"
              alt=""
            />
            <div class="target-name">M31 • Andromeda Galaxy</div>

            <div class="reticle">
              <div class="reticle-ring"></div>
              <div class="reticle-line horizontal"></div>
              <div class="reticle-line vertical"></div>
              <div class="reticle-center"></div>
            </div>

            <div class="preview-tools">
              <span>Zoom 100%</span>
              <span>Histogram</span>
              <span>Plate Solved</span>
            </div>

            <div class="star s1"></div>
            <div class="star s2"></div>
            <div class="star s3"></div>
            <div class="star s4"></div>
            <div class="star s5"></div>
            <div class="star s6"></div>

            <div class="bottom-info">
              <span>300s</span>
              <span>Gain 100</span>
              <span>HFR 2.31</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </section>
      <section class="bottom-guiding-panel">
        <div class="guiding-heading">
          <div>
            <strong>⭐ Guiding</strong>
            <span class="guiding-active">Guiding</span>
          </div>

          <div class="guiding-values">
            <span><b class="ra-label">RA</b> 0.28"</span>
            <span><b class="dec-label">DEC</b> 0.31"</span>
            <span><b>Total RMS</b> 0.42"</span>
            <span class="good">Stable ✓</span>
          </div>
        </div>

        <div class="guiding-chart-area">
          <div class="axis-label axis-plus-four">+4"</div>
          <div class="axis-label axis-plus-two">+2"</div>
          <div class="axis-label axis-zero">0"</div>
          <div class="axis-label axis-minus-two">−2"</div>
          <div class="axis-label axis-minus-four">−4"</div>

          <svg class="bottom-graph" viewBox="0 0 260 90" preserveAspectRatio="none">
            <line x1="0" y1="5" x2="260" y2="5" class="guide-grid" />
            <line x1="0" y1="25" x2="260" y2="25" class="guide-grid" />
            <line x1="0" y1="45" x2="260" y2="45" class="guide-center" />
            <line x1="0" y1="65" x2="260" y2="65" class="guide-grid" />
            <line x1="0" y1="85" x2="260" y2="85" class="guide-grid" />

            <line x1="52" y1="0" x2="52" y2="90" class="guide-grid vertical-grid" />
            <line x1="104" y1="0" x2="104" y2="90" class="guide-grid vertical-grid" />
            <line x1="156" y1="0" x2="156" y2="90" class="guide-grid vertical-grid" />
            <line x1="208" y1="0" x2="208" y2="90" class="guide-grid vertical-grid" />

            <polyline
              class="guide-ra"
              points="0,45 15,41 30,46 45,39 60,43 75,47 90,42 105,45 120,40 135,43 150,46 165,42 180,44 195,41 210,45 225,43 240,46 260,42"
            />

            <polyline
              class="guide-dec"
              points="0,47 15,50 30,44 45,51 60,46 75,43 90,48 105,45 120,49 135,46 150,43 165,47 180,45 195,49 210,44 225,47 240,45 260,46"
            />
          </svg>
        </div>
      </section>
      <section class="mission-strip">
        <div class="sequence-status">
          <div class="sequence-left">
            <div class="sequence-title">🌌 M31 Summer Project</div>

            <div class="sequence-details">
              Light • Frame 38 / 100 • 187 / 300s • Next: Dither • ETA 03:18
            </div>
            <div class="mission-progress">
              <div class="mission-progress-fill"></div>
            </div>
          </div>

          <div class="sequence-buttons">
            <button class="capture-btn">Pause</button>
            <button class="primary-btn">Stop</button>
          </div>
        </div>
      </section>
    </main>

    <aside class="status-panels">
      <div class="panel">
        <h3>📷 Imaging Train A</h3>

        <div class="status-row">
          <span>Scope</span>
          <span>Ultra-Cat 56</span>
        </div>

        <div class="status-row">
          <span>Camera</span>
          <span>ASI2600MC</span>
        </div>

        <div class="status-row">
          <span>Cooler</span>
          <span>-10°C</span>
        </div>

        <div class="status-row">
          <span>HFR</span>
          <span>2.31</span>
        </div>
      </div>

      <div class="panel">
        <h3>📷 Imaging Train B</h3>

        <div class="status-row">
          <span>Scope</span>
          <span>Sharpstar 61EDPH III</span>
        </div>

        <div class="status-row">
          <span>Camera</span>
          <span>ASI2600MC</span>
        </div>

        <div class="status-row">
          <span>Cooler</span>
          <span>-10°C</span>
        </div>

        <div class="status-row">
          <span>HFR</span>
          <span>2.09</span>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.dashboard {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 240px;
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
  overflow: hidden;
}
.mission-actions {
  display: flex;
  gap: 12px;
  align-items: center;
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
  justify-content: flex-start;
  gap: 14px;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}
.nav-icon {
  position: static;
  width: 28px;
  height: auto;
  flex: 0 0 28px;
  display: grid;
  place-items: center;
  font-size: 22px;
  background: transparent;
  border: 0;
  border-radius: 0;
}
.nav-btn span:last-child {
  display: block;
  min-width: 0;
  opacity: 1;
  visibility: visible;
  white-space: nowrap;
}

.nav-btn.active,
.nav-btn:hover {
  background: #2278c9;
  color: white;
}

.preview-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.78;
  background: #020407;
  filter: brightness(0.72) contrast(1.08);
}

.preview-panel {
  min-height: 0;
  height: 100%;
  border-radius: 20px;
  background: #121a28;
  border: 1px solid #26354d;
  overflow: hidden;
}

.preview-header {
  height: 52px;
  padding: 0 18px;
  border-bottom: 1px solid #26354d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
}
.preview-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.18),
    transparent 25%,
    transparent 72%,
    rgba(0, 0, 0, 0.38)
  );
  pointer-events: none;
  z-index: 1;
}

.status-dot {
  color: #69e28f;
  font-size: 13px;
}

.main-area > * {
  min-height: 0;
  min-width: 0;
}

.image-placeholder {
  height: calc(100% - 52px);
  min-height: 0;
  position: relative;
  overflow: hidden;
  color: #7d8ba0;
  text-align: center;
  background: #020407;
}

.target-icon {
  font-size: 54px;
  color: #7cc7ff;
  margin-bottom: 10px;
}

.control-strip {
  min-height: 76px;
  border-radius: 18px;
  background: #111927;
  border: 1px solid #26354d;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.control-strip button {
  border: 0;
  border-radius: 14px;
  padding: 14px 18px;
  background: #1e2b41;
  color: #e8eef8;
  cursor: pointer;
  font-weight: bold;
}

.control-strip button {
  border: 0;
  border-radius: 14px;
  padding: 16px 20px;
  color: #e8eef8;
  cursor: pointer;
  font-weight: bold;
}

.status-panels {
  background: #111927;
  border-left: 1px solid #253044;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  overflow-y: hidden;
}

.panel {
  border-radius: 18px;
  background: #182235;
  border: 1px solid #2a3a54;
  padding: 12px;
}

.panel h3 {
  margin: 0 0 12px;
  color: #7cc7ff;
  font-size: 16px;
}

.panel p {
  margin: 6px 0;
  color: #c8d5e8;
}

.top-status-bar {
  min-height: 54px;
  border-radius: 18px;
  background: #111927;
  border: 1px solid #26354d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  font-weight: bold;
}

.top-status-items {
  display: flex;
  gap: 16px;
  color: #9fb1c8;
  font-size: 13px;
}
.preview-overlay {
  position: relative;
  width: 100%;
  height: 100%;
}

.target-name {
  position: absolute;
  top: 24px;
  left: 28px;
  color: #7cc7ff;
  font-weight: bold;
  font-size: 17px;
}

.crosshair {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #66ccff;
  font-size: 32px;
}

.star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 8px white;
}

.s1 {
  left: 20%;
  top: 25%;
}
.s2 {
  left: 35%;
  top: 60%;
}
.s3 {
  left: 70%;
  top: 40%;
}
.s4 {
  left: 80%;
  top: 18%;
}
.s5 {
  left: 58%;
  top: 72%;
}
.s6 {
  left: 15%;
  top: 80%;
}

.bottom-info {
  position: absolute;
  bottom: 18px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  color: #d7e7ff;
  font-size: 13px;
}
.control-card {
  min-width: 105px;
  border-radius: 14px;
  background: #182235;
  border: 1px solid #2a3a54;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-card .label {
  color: #8fa4bd;
  font-size: 12px;
}

.control-card strong {
  color: #e8eef8;
  font-size: 18px;
}

.capture-btn {
  background: #1e2b41;
}

.primary-btn {
  background: #2278c9;
  margin-left: auto;
}
.reticle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 130px;
  height: 130px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.reticle-ring {
  position: absolute;
  inset: 22px;
  border: 1px solid rgba(102, 204, 255, 0.65);
  border-radius: 50%;
  box-shadow: 0 0 18px rgba(102, 204, 255, 0.25);
}

.reticle-line {
  position: absolute;
  background: rgba(102, 204, 255, 0.75);
}

.reticle-line.horizontal {
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
}

.reticle-line.vertical {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
}

.reticle-center {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  border: 1px solid #66ccff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: rgba(102, 204, 255, 0.15);
}

.frame-box {
  position: absolute;
  left: 12%;
  right: 12%;
  top: 13%;
  bottom: 13%;
  border: 1px solid rgba(124, 199, 255, 0.18);
  border-radius: 8px;
  box-shadow: inset 0 0 30px rgba(124, 199, 255, 0.05);
  pointer-events: none;
}

.preview-tools {
  position: absolute;
  top: 26px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.preview-tools span {
  border-radius: 999px;
  background: rgba(24, 34, 53, 0.85);
  border: 1px solid rgba(124, 199, 255, 0.25);
  padding: 7px 10px;
  color: #cfe7ff;
  font-size: 12px;
}
.mission-strip {
  min-height: 0;
  height: auto;
  border-radius: 18px;
  background: #111927;
  border: 1px solid #26354d;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
}

.mission-card {
  min-width: 0px;
  flex: 1;
  border-radius: 14px;
  background: #182235;
  border: 1px solid #2a3a54;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.mission-card.wide {
  flex: 1.4;
}

.mission-card .label {
  color: #8fa4bd;
  font-size: 12px;
}

.mission-card strong {
  color: #e8eef8;
  font-size: 17px;
}

.danger-btn {
  background: #8f2f3a;
}
.session-title {
  flex: 1;
  min-width: 0;

  font-size: 22px;
  font-weight: 700;
  color: #f4f7fb;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-running {
  color: #69e28f;
  font-weight: 700;
}
.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  font-size: 14px;
  color: #d5e3f5;
}

.status-row span:first-child {
  color: #8fa4bd;
}

.good {
  color: #69e28f;
  font-weight: 700;
}
.guiding-panel {
  min-height: 240px;
  padding-bottom: 18px;
}

.guiding-graph {
  margin: 12px 0 16px;
  height: 110px;
  border-radius: 12px;
  background: #0b111a;
  border: 1px solid #27364c;
  overflow: hidden;
}

.guiding-graph svg {
  width: 100%;
  height: 100%;
}

.guide-grid {
  stroke: #2b3b53;
  stroke-width: 1;
  opacity: 0.55;
}

.guide-center {
  stroke: #9fb8d8;
  stroke-width: 1.5;
}

.guide-ra {
  fill: none;
  stroke: #2f83e4;
  stroke-width: 2.4;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.guide-dec {
  fill: none;
  stroke: #ff6b87;
  stroke-width: 2.4;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.main-area {
  height: 100vh;
  box-sizing: border-box;

  padding: 10px 16px;

  display: grid;
  grid-template-rows:
    90px
    minmax(300px, 2.2fr)
    minmax(145px, 0.75fr)
    95px;

  gap: 10px;

  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.sequence-status {
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.sequence-left {
  flex: 1;
  min-width: 0;
}

.sequence-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.sequence-details {
  color: #9eb3cb;
  font-size: 14px;
}
.sequence-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}
.sequence-buttons button {
  width: 130px;
  height: 56px;
  border: 1px solid #334864;
  border-radius: 12px;
  padding: 0;
  color: #ffffff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
}
.sequence-buttons button:hover {
  filter: brightness(1.12);
}
.bottom-guiding-panel {
  min-height: 0;
  border-radius: 18px;
  background: #111927;
  border: 1px solid #26354d;
  padding: 12px 14px;
  overflow: hidden;
  box-sizing: border-box;
}

.guiding-heading {
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.guiding-heading strong {
  color: #7cc7ff;
  font-size: 15px;
}

.guiding-active {
  margin-left: 12px;
  color: #69e28f;
  font-size: 12px;
  font-weight: 700;
}

.guiding-values {
  display: flex;
  align-items: center;
  gap: 18px;
  color: #d5e3f5;
  font-size: 12px;
}

.axis-label {
  position: absolute;
  left: 0;
  color: #71849d;
  font-size: 10px;
  width: 27px;
  text-align: right;
}

.axis-plus-four {
  top: 0;
}

.axis-plus-two {
  top: 23px;
}

.axis-zero {
  top: 46px;
}

.axis-minus-two {
  top: 69px;
}

.axis-minus-four {
  top: 91px;
}

.ra-label {
  color: #2f83e4;
}

.dec-label {
  color: #ff6b87;
}

.guiding-chart-area {
  position: relative;
  height: 105px;
  padding-left: 32px;
  margin-top: -4px;
}

.bottom-graph {
  width: 100%;
  height: 105px;
  display: block;
  margin: 0;
}

.vertical-grid {
  opacity: 0.35;
}

.preview-panel {
  overflow: hidden;
}

.status-panels {
  overflow: hidden;
}

.mission-progress {
  width: 100%;
  height: 8px;
  margin-top: 14px;

  background: #0d1522;
  border: 1px solid #26354d;
  border-radius: 999px;

  overflow: hidden;
}

.mission-progress-fill {
  width: 62%;
  height: 100%;

  background: linear-gradient(90deg, #2f83e4, #4ea2ff);
  border-radius: inherit;

  transition: width 0.3s ease;
}
</style>

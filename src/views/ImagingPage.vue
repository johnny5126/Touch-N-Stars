<template>
  <main class="imaging-page">
    <header class="imaging-header">
      <div>
        <p class="imaging-eyebrow">Capture Control</p>
        <h1>Imaging</h1>
        <p class="imaging-subtitle">Configure and run the active imaging sequence.</p>
      </div>

      <button class="secondary-btn" @click="$router.push('/dashboard')">← Dashboard</button>
    </header>

    <section class="imaging-layout">
      <div class="imaging-main">
        <article class="imaging-card">
          <div class="card-heading">
            <div>
              <p class="card-eyebrow">Sequence</p>
              <h2>Exposure Plan</h2>
            </div>

            <span class="status-badge">Ready</span>
          </div>

          <div class="sequence-placeholder">Sequence controls will go here.</div>
        </article>

        <article class="imaging-card">
          <div class="card-heading">
            <div>
              <p class="card-eyebrow">Progress</p>
              <h2>Session Status</h2>
            </div>
          </div>

          <div class="progress-placeholder">Session progress will go here.</div>
        </article>
      </div>

      <aside class="imaging-sidebar">
        <article class="imaging-card">
          <p class="card-eyebrow">Equipment</p>
          <h2>Imaging Train A</h2>
          <p>Ultra-Cat 56</p>
          <p>ASI2600MC</p>
        </article>

        <article class="imaging-card">
          <p class="card-eyebrow">Equipment</p>
          <h2>Imaging Train B</h2>
          <p>Hope D60</p>
          <p>Camera not selected</p>
        </article>

        <div class="run-controls">
          <button class="primary-btn">Start Sequence</button>
          <button class="secondary-btn">Pause</button>
          <button class="danger-btn">Stop</button>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup></script>

<style scoped>
.imaging-page {
  min-height: 100vh;
  padding: 34px 42px;
  color: #eef5ff;
  background:
    radial-gradient(circle at top right, rgba(34, 91, 157, 0.15), transparent 36%), #07111f;
}

.imaging-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.imaging-eyebrow,
.card-eyebrow {
  margin: 0 0 6px;
  color: #6fa8e8;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.imaging-header h1,
.card-heading h2,
.imaging-card h2 {
  margin: 0;
}

.imaging-subtitle {
  margin: 10px 0 0;
  color: #8fa9cb;
}

.imaging-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
}

.imaging-main,
.imaging-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.imaging-card {
  padding: 24px;
  border: 1px solid #1f3b5c;
  border-radius: 16px;
  background: rgba(10, 25, 43, 0.92);
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-badge {
  padding: 7px 12px;
  border: 1px solid #2f805d;
  border-radius: 999px;
  color: #6ce0a6;
  background: rgba(44, 128, 91, 0.15);
  font-size: 13px;
  font-weight: 700;
}

.sequence-placeholder,
.progress-placeholder {
  display: grid;
  place-items: center;
  min-height: 220px;
  margin-top: 22px;
  border: 1px dashed #294868;
  border-radius: 14px;
  color: #718cac;
}

.run-controls {
  display: grid;
  gap: 12px;
}

.primary-btn,
.secondary-btn,
.danger-btn {
  min-height: 48px;
  padding: 0 22px;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  font-size: 15px;
  font-weight: 750;
}

.primary-btn {
  border: 1px solid #4da0f4;
  background: linear-gradient(180deg, #348be5, #256fc2);
}

.secondary-btn {
  border: 1px solid #334e6d;
  background: #10243a;
}

.danger-btn {
  border: 1px solid #a44a5a;
  background: #6f2635;
}

@media (max-width: 900px) {
  .imaging-page {
    padding: 24px;
  }

  .imaging-layout {
    grid-template-columns: 1fr;
  }
}
</style>

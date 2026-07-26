<script setup>
import { useTargetStore } from '@/store/targetStore';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { targetCatalog } from '@/data/targetCatalog';

const router = useRouter();
const searchQuery = ref('');
const targetStore = useTargetStore();
const filteredTargets = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  if (!query) {
    return targetCatalog;
  }

  return targetCatalog.filter((target) => {
    return (
      target.name.toLowerCase().includes(query) ||
      target.commonName.toLowerCase().includes(query) ||
      target.type.toLowerCase().includes(query) ||
      target.constellation.toLowerCase().includes(query)
    );
  });
});

function returnToPlan() {
  router.push('/plan');
}
function selectTarget(target) {
  targetStore.setTarget(target);
  router.push('/plan');
}
</script>

<template>
  <div class="choose-target-page">
    <aside class="side-nav">
      <div class="logo">TNS</div>

      <button class="nav-btn">
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

      <button class="nav-btn active" @click="returnToPlan">
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

    <main class="target-main">
      <section class="target-header">
        <div>
          <span class="section-label">Session Planning</span>
          <h1>Choose Target</h1>
          <p>Search the catalog or select one of tonight’s recommended objects.</p>
        </div>

        <button class="back-btn" @click="returnToPlan">← Back to Plan</button>
      </section>

      <section class="search-card">
        <label for="target-search">Search targets</label>

        <input
          id="target-search"
          v-model="searchQuery"
          type="search"
          placeholder="Search M31, Orion, galaxy, Cygnus..."
        />
      </section>

      <section class="category-row">
        <button class="category-btn active">Best Tonight</button>
        <button class="category-btn">Favorites</button>
        <button class="category-btn">Messier</button>
        <button class="category-btn">NGC / IC</button>
        <button class="category-btn">Recent</button>
      </section>

      <section class="target-grid">
        <article v-for="target in filteredTargets" :key="target.id" class="target-card">
          <div class="target-preview">
            <span>{{ target.name }}</span>
          </div>

          <div class="target-details">
            <span class="target-type">{{ target.type }}</span>
            <h2>{{ target.commonName }}</h2>
            <p>{{ target.name }} • {{ target.constellation }}</p>

            <div class="target-stats">
              <div>
                <span>Magnitude</span>
                <strong>{{ target.magnitude }}</strong>
              </div>

              <div>
                <span>Size</span>
                <strong>{{ target.size }}</strong>
              </div>
            </div>

            <button class="select-btn" @click="selectTarget(target)">Select Target</button>
          </div>
        </article>
      </section>

      <p v-if="filteredTargets.length === 0" class="empty-message">No targets match that search.</p>
    </main>
  </div>
</template>

<style scoped>
.choose-target-page {
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
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #111927;
  border-right: 1px solid #253044;
}

.logo {
  width: 100%;
  height: 60px;
  flex-shrink: 0;
  margin-bottom: 8px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #1d2a3d;
  color: #7cc7ff;
  font-size: 22px;
  font-weight: 700;
}

.nav-btn {
  width: 100%;
  min-height: 62px;
  flex-shrink: 0;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: #182235;
  color: #cbd8ea;
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

.target-main {
  min-width: 0;
  min-height: 0;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.target-header,
.search-card {
  border: 1px solid #26354d;
  border-radius: 18px;
  background: #111927;
}

.target-header {
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.target-header h1 {
  margin: 3px 0 0;
}

.target-header p {
  margin: 6px 0 0;
  color: #9fb1c8;
}

.section-label,
.target-type {
  color: #7cc7ff;
  font-size: 13px;
  font-weight: 700;
}

.back-btn,
.category-btn,
.select-btn {
  border: 0;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.back-btn {
  padding: 12px 16px;
  background: #1e2b41;
  border: 1px solid #334864;
}

.search-card {
  padding: 18px 22px;
}

.search-card label {
  display: block;
  margin-bottom: 8px;
  color: #9fb1c8;
  font-size: 13px;
  font-weight: 700;
}

.search-card input {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 15px;
  border: 1px solid #334864;
  border-radius: 12px;
  outline: none;
  background: #0c1420;
  color: #e8eef8;
  font-size: 16px;
}

.search-card input:focus {
  border-color: #2f83e4;
}

.category-row {
  display: flex;
  gap: 9px;
  overflow-x: auto;
}

.category-btn {
  flex-shrink: 0;
  padding: 11px 16px;
  background: #182235;
  color: #aebed2;
}

.category-btn.active,
.category-btn:hover {
  background: #2278c9;
  color: white;
}

.target-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.target-card {
  min-width: 0;
  overflow: hidden;
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  border: 1px solid #26354d;
  border-radius: 18px;
  background: #111927;
}

.target-preview {
  min-height: 240px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 35% 40%, rgba(255, 255, 255, 0.9) 0 1px, transparent 2px),
    radial-gradient(circle at 70% 24%, rgba(255, 255, 255, 0.7) 0 1px, transparent 2px),
    radial-gradient(circle at 62% 72%, rgba(255, 255, 255, 0.8) 0 1px, transparent 2px),
    linear-gradient(145deg, #111b2c, #05080e);
  color: #7cc7ff;
  font-size: 25px;
  font-weight: 700;
}

.target-details {
  min-width: 0;
  padding: 18px;
}

.target-details h2 {
  margin: 6px 0;
}

.target-details p {
  margin: 0;
  color: #9fb1c8;
}

.target-stats {
  margin: 20px 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.target-stats div {
  padding: 11px;
  border-radius: 11px;
  background: #0c1420;
}

.target-stats span,
.target-stats strong {
  display: block;
}

.target-stats span {
  margin-bottom: 5px;
  color: #8397b1;
  font-size: 12px;
}

.select-btn {
  width: 100%;
  padding: 12px 16px;
  background: #2278c9;
}

.empty-message {
  padding: 30px;
  border: 1px solid #26354d;
  border-radius: 18px;
  background: #111927;
  color: #9fb1c8;
  text-align: center;
}

@media (max-width: 1100px) {
  .choose-target-page {
    grid-template-columns: 190px minmax(0, 1fr);
  }

  .target-grid {
    grid-template-columns: 1fr;
  }
}
</style>

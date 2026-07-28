<script setup>
import { computed, ref } from 'vue';

const hasMeasurement = ref(false);
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

const isAligned = computed(() => {
  return hasMeasurement.value && Math.abs(targetX.value) <= 4 && Math.abs(targetY.value) <= 4;
});

const previewStatus = computed(() => {
  if (isAligned.value) return 'Aligned';

  if (isBusy.value) {
    if (alignmentStatus.value.toLowerCase().includes('solving')) return 'Solving...';
    if (alignmentStatus.value.toLowerCase().includes('capturing')) return 'Capturing...';
    if (alignmentStatus.value.toLowerCase().includes('calculating')) return 'Calculating...';
  }

  if (hasMeasurement.value) return 'Plate Solved';

  return 'Ready';
});

const previewStatusClass = computed(() => ({
  aligned: isAligned.value,
  working: isBusy.value,
}));

const displayedPolarError = computed(() => {
  if (isAligned.value) return `0' 18"`;
  return polarError.value || 'Not measured';
});

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

// Fixed: Moved to top-level scope so both startPolarAlignment & continueAlignment can call it
function simulateMountAdjustment() {
  if (!hasMeasurement.value || isBusy.value) return;

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

async function startPolarAlignment() {
  if (isBusy.value) return;

  alignmentStarted.value = true;
  isBusy.value = true;
  hasMeasurement.value = false;

  polarError.value = null;
  altitudeCorrection.value = null;
  azimuthCorrection.value = null;
  alignmentQuality.value = null;

  targetX.value = -32;
  targetY.value = 24;

  // Step 1: Capture and solve first image
  currentStep.value = 1;
  progress.value = 15;
  alignmentStatus.value = 'Capturing first star field';

  await captureExposure(exposure.value);

  alignmentStatus.value = 'Plate solving first image...';
  progress.value = 30;

  await wait(1800);

  // Step 2: Rotate mount
  currentStep.value = 2;
  progress.value = 45;
  alignmentStatus.value = `Rotating mount ${rotationAngle.value}°`;

  previewRotation.value = rotationAngle.value;
  mountRotation.value = 0;

  const rotationSteps = 60;
  const rotationDuration = 2200;
  const rotationDelay = rotationDuration / rotationSteps;

  for (let step = 1; step <= rotationSteps; step += 1) {
    mountRotation.value = Number(((rotationAngle.value * step) / rotationSteps).toFixed(1));
    await wait(rotationDelay);
  }

  mountRotation.value = rotationAngle.value;
  previewRotation.value = 0;

  // Step 3: Capture and solve second image
  currentStep.value = 3;
  progress.value = 60;
  alignmentStatus.value = 'Capturing second star field';

  await captureExposure(exposure.value);

  alignmentStatus.value = 'Plate solving second image...';
  progress.value = 75;

  await wait(1800);

  // Step 4: Calculate polar error
  currentStep.value = 4;
  progress.value = 90;
  alignmentStatus.value = 'Calculating polar alignment error';

  await wait(1500);

  // Step 5: Display adjustment result
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
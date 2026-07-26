import * as Astronomy from 'astronomy-engine';

/**
 * Converts an RA string such as "03h 47m 24s" into decimal hours.
 */
export function parseRightAscension(ra) {
  if (typeof ra === 'number') {
    return ra;
  }

  const match = String(ra).match(/(\d+(?:\.\d+)?)h\s*(\d+(?:\.\d+)?)m\s*(\d+(?:\.\d+)?)s/i);

  if (!match) {
    throw new Error(`Invalid right ascension: ${ra}`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);

  return hours + minutes / 60 + seconds / 3600;
}

/**
 * Converts a DEC string such as "+41° 16′ 09″" or "−05° 23′ 28″"
 * into decimal degrees.
 */
export function parseDeclination(dec) {
  if (typeof dec === 'number') {
    return dec;
  }

  const normalized = String(dec).replace(/−/g, '-').replace(/–/g, '-');

  const match = normalized.match(
    /([+-]?\d+(?:\.\d+)?)°\s*(\d+(?:\.\d+)?)['′]\s*(\d+(?:\.\d+)?)["″]/
  );

  if (!match) {
    throw new Error(`Invalid declination: ${dec}`);
  }

  const degreeValue = Number(match[1]);
  const sign = degreeValue < 0 ? -1 : 1;
  const degrees = Math.abs(degreeValue);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);

  return sign * (degrees + minutes / 60 + seconds / 3600);
}

function getCompassDirection(azimuth) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(azimuth / 45) % 8;

  return directions[index];
}

/**
 * Calculates the target's altitude and azimuth for an observer.
 */
export function calculateTargetPosition({
  target,
  latitude,
  longitude,
  elevation = 0,
  date = new Date(),
}) {
  if (!target?.ra || !target?.dec) {
    throw new Error('The selected target does not have RA and DEC coordinates.');
  }

  const observerLatitude = Number(latitude);
  const observerLongitude = Number(longitude);
  const observerElevation = Number(elevation) || 0;

  if (!Number.isFinite(observerLatitude) || !Number.isFinite(observerLongitude)) {
    throw new Error('A valid observer latitude and longitude are required.');
  }

  const raHours = parseRightAscension(target.ra);
  const decDegrees = parseDeclination(target.dec);

  const observer = new Astronomy.Observer(observerLatitude, observerLongitude, observerElevation);

  const horizontal = Astronomy.Horizon(date, observer, raHours, decDegrees, 'normal');

  return {
    altitude: horizontal.altitude,
    azimuth: horizontal.azimuth,
    compassDirection: getCompassDirection(horizontal.azimuth),
    altitudeDisplay: `${horizontal.altitude.toFixed(1)}°`,
    azimuthDisplay: `${horizontal.azimuth.toFixed(1)}° ${getCompassDirection(horizontal.azimuth)}`,
  };
}

/**
 * Calculates when a target is above the observer's minimum imaging altitude
 * during the next 24 hours.
 */
export function calculateImagingWindow({
  target,
  latitude,
  longitude,
  elevation = 0,
  minimumAltitude = 30,
  startDate = new Date(),
}) {
  const stepMinutes = 5;
  const totalMinutes = 24 * 60;
  const samples = [];
  const searchStart = new Date(startDate);

  // An observing night runs from local noon to local noon.
  // Before noon, use yesterday's noon so the current night is included.
  if (searchStart.getHours() < 12) {
    searchStart.setDate(searchStart.getDate() - 1);
  }

  searchStart.setHours(12, 0, 0, 0);
  const observer = new Astronomy.Observer(Number(latitude), Number(longitude), Number(elevation));

  for (let minutes = 0; minutes <= totalMinutes; minutes += stepMinutes) {
    const date = new Date(searchStart.getTime() + minutes * 60 * 1000);

    const position = calculateTargetPosition({
      target,
      latitude,
      longitude,
      elevation,
      date,
    });

    const sunEquator = Astronomy.Equator('Sun', date, observer, true, true);

    const sunHorizontal = Astronomy.Horizon(
      date,
      observer,
      sunEquator.ra,
      sunEquator.dec,
      'normal'
    );

    samples.push({
      date,
      altitude: position.altitude,
      sunAltitude: sunHorizontal.altitude,
    });
  }

  const minimum = Number(minimumAltitude);
  const sunLimit = -18;

  const windows = [];
  let currentStartIndex = null;

  for (let index = 0; index < samples.length; index += 1) {
    const isUsable = samples[index].altitude >= minimum && samples[index].sunAltitude <= sunLimit;

    if (isUsable && currentStartIndex === null) {
      currentStartIndex = index;
    }

    const isLastSample = index === samples.length - 1;

    if (currentStartIndex !== null && (!isUsable || isLastSample)) {
      const endIndex = isUsable && isLastSample ? index : index - 1;

      windows.push({
        startIndex: currentStartIndex,
        endIndex,
      });

      currentStartIndex = null;
    }
  }

  if (windows.length === 0) {
    return {
      status: 'unavailable',
      start: null,
      end: null,
      transit: null,
      maximumAltitude: null,
      durationHours: 0,
    };
  }

  const longestWindow = windows.reduce((longest, window) => {
    const windowDuration =
      samples[window.endIndex].date.getTime() - samples[window.startIndex].date.getTime();

    const longestDuration =
      samples[longest.endIndex].date.getTime() - samples[longest.startIndex].date.getTime();

    return windowDuration > longestDuration ? window : longest;
  });

  const windowSamples = samples.slice(longestWindow.startIndex, longestWindow.endIndex + 1);

  const highestSample = windowSamples.reduce((highest, sample) => {
    return sample.altitude > highest.altitude ? sample : highest;
  });

  const firstUsable = windowSamples[0];
  const lastUsable = windowSamples[windowSamples.length - 1];

  const durationMilliseconds = lastUsable.date.getTime() - firstUsable.date.getTime();

  return {
    status: 'available',
    start: firstUsable.date,
    end: lastUsable.date,
    transit: highestSample.date,
    maximumAltitude: highestSample.altitude,
    durationHours: durationMilliseconds / (1000 * 60 * 60),
  };
}

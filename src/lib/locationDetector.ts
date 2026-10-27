import { UserLocation } from '../types';
import { DAYR_HAFIR_DEFAULT } from './initialData';

export interface LocationDetectionResult {
  latitude: number;
  longitude: number;
  districtName: string;
  source: 'gps' | 'default';
  accuracy?: number;
}

/**
 * Reverse geocode coordinates to an Arabic street / neighborhood name
 * Uses OpenStreetMap Nominatim with language 'ar'
 */
export async function reverseGeocodeArabic(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar&zoom=17`,
      {
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.street || addr.pedestrian || addr.neighbourhood || addr.suburb || addr.quarter;
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state;
        
        if (street && city) {
          return `${city} - ${street}`;
        }
        if (city) {
          return `${city}`;
        }
        if (data.display_name) {
          const parts = data.display_name.split(',');
          return parts.slice(0, 2).join(' - ').trim();
        }
      }
    }
  } catch {
    // Fail silently, return coordinates or standard label
  }
  return '';
}

/**
 * Request Browser Geolocation (Strict Physical GPS Hardware)
 * Uses enableHighAccuracy: true and maximumAge: 0 to force fresh satellite/hardware GPS sampling.
 */
export function getBrowserGeolocation(timeout = 10000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation hardware not supported by browser'));
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true, // Forces physical GPS hardware
        timeout,
        maximumAge: 0 // Forces fresh real-time sample, never cached
      }
    );
  });
}

/**
 * Strict Physical GPS Detection Pipeline:
 * - Detects strictly via hardware GPS (navigator.geolocation).
 * - Ignores IP / ISP / VPN provider geolocation completely to prevent any VPN skew/errors.
 * - Reverse geocodes exact GPS coordinates to Arabic neighborhood / street name.
 * - Falls back safely to Dayr Hafir central default if GPS is disabled on the phone/device.
 */
export async function detectRealLocationAutomatically(
  onUpdate?: (loc: UserLocation) => void
): Promise<UserLocation> {
  try {
    const pos = await getBrowserGeolocation(10000);
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;

    // Get Arabic neighborhood or street name
    const friendlyName = await reverseGeocodeArabic(lat, lng);
    const accuracyTag = accuracy && accuracy < 100 ? ` (±${accuracy}م)` : '';

    const result: UserLocation = {
      latitude: lat,
      longitude: lng,
      districtName: friendlyName ? `${friendlyName}${accuracyTag}` : `موقعك الفعلي (GPS${accuracyTag})`,
      isAuto: true,
      source: 'gps'
    };

    if (onUpdate) onUpdate(result);
    return result;
  } catch (err) {
    console.warn('Physical GPS detection unavailable or permission denied:', err);
  }

  // Safe fallback if GPS hardware is turned off or denied by user: Default Dayr Hafir location
  const fallback: UserLocation = {
    latitude: DAYR_HAFIR_DEFAULT.latitude,
    longitude: DAYR_HAFIR_DEFAULT.longitude,
    districtName: DAYR_HAFIR_DEFAULT.districtName,
    isAuto: false,
    source: 'default'
  };

  if (onUpdate) onUpdate(fallback);
  return fallback;
}

// ClockDock Phase 4 — Open-Meteo Weather Integration
// Free, open-source, zero API keys, privacy-respecting weather data with offline caching
import { WeatherData, WeatherConditionCode, GeocodingResult } from '../types';
import { loadWeatherCache, saveWeatherCache } from './storage';

export const POPULAR_WEATHER_CITIES = [
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405 },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { name: 'Mumbai', country: 'India', latitude: 19.076, longitude: 72.8777 },
];

/**
 * Maps WMO (World Meteorological Organization) weather interpretation codes
 * from Open-Meteo to human-readable conditions and icon types.
 */
export function mapWmoCodeToCondition(code: number): {
  condition: string;
  conditionCode: WeatherConditionCode;
} {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', conditionCode: 'clear' };
    case 1:
      return { condition: 'Mainly Clear', conditionCode: 'clear' };
    case 2:
      return { condition: 'Partly Cloudy', conditionCode: 'partly-cloudy' };
    case 3:
      return { condition: 'Overcast', conditionCode: 'cloudy' };
    case 45:
    case 48:
      return { condition: 'Foggy', conditionCode: 'fog' };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return { condition: 'Drizzle', conditionCode: 'drizzle' };
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return { condition: 'Rain', conditionCode: 'rain' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { condition: 'Snow', conditionCode: 'snow' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', conditionCode: 'heavy-rain' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', conditionCode: 'snow' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', conditionCode: 'thunderstorm' };
    default:
      return { condition: 'Clear', conditionCode: 'clear' };
  }
}

/**
 * Formats a temperature in Celsius to either °C or °F with appropriate symbol.
 */
export function formatTemperature(
  celsius: number | undefined,
  unit: 'celsius' | 'fahrenheit'
): string {
  if (typeof celsius !== 'number' || isNaN(celsius)) return '--';
  if (unit === 'fahrenheit') {
    const f = Math.round((celsius * 9) / 5 + 32);
    return `${f}°`;
  }
  return `${Math.round(celsius)}°`;
}

/**
 * Searches cities using Open-Meteo's open geocoding API.
 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=6&language=en&format=json`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((r: {
      name: string;
      country?: string;
      admin1?: string;
      latitude: number;
      longitude: number;
    }) => ({
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetches current weather and daily high/low temperatures from Open-Meteo.
 * Includes caching, rate-limit throttling (20 minutes), and offline resiliency.
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  locationName: string,
  forceRefresh: boolean = false
): Promise<WeatherData | null> {
  const cached = loadWeatherCache();
  const now = Date.now();

  // If cached data exists for the same location and is under 20 minutes old, reuse without network request
  const isSameLocation =
    cached &&
    cached.locationName.toLowerCase() === locationName.toLowerCase() &&
    Math.abs(cached.temperatureCelsius) < 90;

  if (!forceRefresh && isSameLocation && cached && now - cached.fetchedAt < 20 * 60 * 1000) {
    return cached;
  }

  // If offline, return cached data if available and mark as stale
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    if (cached) {
      return { ...cached, isStale: true };
    }
    return null;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (cached) return { ...cached, isStale: true };
      return null;
    }

    const data = await res.json();
    const currentTemp = data.current?.temperature_2m;
    const weatherCode = data.current?.weather_code ?? 0;
    const tempHigh = data.daily?.temperature_2m_max?.[0];
    const tempLow = data.daily?.temperature_2m_min?.[0];

    if (typeof currentTemp !== 'number' || isNaN(currentTemp)) {
      if (cached) return { ...cached, isStale: true };
      return null;
    }

    const { condition, conditionCode } = mapWmoCodeToCondition(weatherCode);

    const freshWeather: WeatherData = {
      temperatureCelsius: currentTemp,
      condition,
      conditionCode,
      tempHighCelsius: typeof tempHigh === 'number' ? tempHigh : undefined,
      tempLowCelsius: typeof tempLow === 'number' ? tempLow : undefined,
      locationName,
      fetchedAt: now,
      isStale: false,
    };

    saveWeatherCache(freshWeather);
    return freshWeather;
  } catch {
    // If request fails (e.g. timeout, offline, network restriction), gracefully fallback to cache
    if (cached) {
      return { ...cached, isStale: true };
    }
    return null;
  }
}

/**
 * Requests the device's current geolocation.
 * ONLY called upon explicit user click in settings; never called automatically.
 */
export async function getCurrentDevicePosition(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  });
}

/**
 * Real-Time Weather Service
 * Connects to Open-Meteo Free API with Geocoding
 * Zero API keys required, global coverage, live forecasts
 */

const WOXSEN_COORDS = {
  name: 'Woxsen University, Hyderabad',
  admin: 'Telangana',
  country: 'India',
  latitude: 17.6534,
  longitude: 77.9224
};

const HYDERABAD_COORDS = {
  name: 'Hyderabad',
  admin: 'Telangana',
  country: 'India',
  latitude: 17.3850,
  longitude: 78.4867
};

const WEATHER_CODE_MAP = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Moderate Drizzle', icon: '🌦️' },
  55: { label: 'Dense Drizzle', icon: '🌧️' },
  61: { label: 'Slight Rain', icon: '🌧️' },
  63: { label: 'Moderate Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  71: { label: 'Slight Snowfall', icon: '🌨️' },
  73: { label: 'Moderate Snowfall', icon: '❄️' },
  75: { label: 'Heavy Snowfall', icon: '❄️' },
  80: { label: 'Slight Rain Showers', icon: '🌦️' },
  81: { label: 'Moderate Rain Showers', icon: '🌧️' },
  82: { label: 'Violent Rain Showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with Slight Hail', icon: '⛈️' },
  99: { label: 'Thunderstorm with Heavy Hail', icon: '⛈️' }
};

function decodeWeather(code) {
  return WEATHER_CODE_MAP[code] || { label: 'Clear', icon: '☀️' };
}

/**
 * Resolve location to coordinates using Geocoding API
 */
async function geocodeLocation(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q || q.includes('woxsen') || q.includes('campus') || q.includes('kamkole') || q.includes('sadasivpet')) {
    return WOXSEN_COORDS;
  }
  if (q.includes('hyderabad')) {
    return HYDERABAD_COORDS;
  }

  try {
    const cleanQuery = encodeURIComponent(query.replace(/weather\s+(in|at|for)?/gi, '').trim());
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cleanQuery}&count=1&language=en&format=json`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const top = data.results[0];
        return {
          name: top.name,
          admin: top.admin1 || top.country,
          country: top.country || '',
          latitude: top.latitude,
          longitude: top.longitude
        };
      }
    }
  } catch (err) {
    console.warn('[Weather Service] Geocoding fallback to Hyderabad:', err.message);
  }

  return HYDERABAD_COORDS;
}

/**
 * Fetch real-time weather and 3-day forecast
 */
async function getWeather(locationName = 'Hyderabad') {
  try {
    const location = await geocodeLocation(locationName);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const conditionInfo = decodeWeather(current.weather_code);

    const forecast = [];
    if (daily.time && daily.time.length > 0) {
      for (let i = 0; i < daily.time.length; i++) {
        const dayCode = daily.weather_code ? daily.weather_code[i] : 0;
        const info = decodeWeather(dayCode);
        forecast.push({
          date: daily.time[i],
          maxTemp: Math.round(daily.temperature_2m_max ? daily.temperature_2m_max[i] : current.temperature_2m),
          minTemp: Math.round(daily.temperature_2m_min ? daily.temperature_2m_min[i] : current.temperature_2m - 5),
          condition: info.label,
          icon: info.icon
        });
      }
    }

    return {
      success: true,
      location: `${location.name}${location.admin ? `, ${location.admin}` : ''}${location.country ? ` (${location.country})` : ''}`,
      coordinates: {
        lat: location.latitude,
        lng: location.longitude
      },
      temperature: Math.round(current.temperature_2m ?? 28),
      feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 28),
      condition: conditionInfo.label,
      conditionCode: current.weather_code ?? 0,
      icon: conditionInfo.icon,
      humidity: current.relative_humidity_2m ?? 40,
      windSpeed: Math.round(current.wind_speed_10m ?? 10),
      forecast,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Weather Service Error]:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: {
        location: 'Hyderabad, Telangana (India)',
        temperature: 28,
        feelsLike: 29,
        condition: 'Clear Sky',
        icon: '☀️',
        humidity: 38,
        windSpeed: 11,
        forecast: [
          { date: 'Today', maxTemp: 31, minTemp: 21, condition: 'Clear Sky', icon: '☀️' },
          { date: 'Tomorrow', maxTemp: 32, minTemp: 22, condition: 'Partly Cloudy', icon: '⛅' },
          { date: 'Day After', maxTemp: 30, minTemp: 21, condition: 'Mainly Clear', icon: '🌤️' }
        ]
      }
    };
  }
}

module.exports = {
  getWeather,
  geocodeLocation
};

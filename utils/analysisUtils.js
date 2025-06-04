// utils/analysisUtils.js

export const getCongestionColor = (level) => {
  switch (level) {
    case 'low': return 'green';
    case 'moderate': return 'yellow';
    case 'heavy': return 'orange';
    case 'severe': return 'red';
    default: return 'gray';
  }
};

export function mapWeatherCodeToIcon(code) {
  if ([0].includes(code)) return "☀️";
  if ([1].includes(code)) return "🌤";
  if ([2].includes(code)) return "🌥";
  if ([3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧";
  if ([71, 73, 75, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "🌩";
  return "❓";
}

export const calculateCurvature = (coordinates) => {
  let totalCurvature = 0;
  for (let i = 1; i < coordinates.length - 1; i += 100) {
    const p1 = coordinates[i - 1];
    const p2 = coordinates[i];
    const p3 = coordinates[i + 1];
    const vector1 = { x: p2[0] - p1[0], y: p2[1] - p1[1] };
    const vector2 = { x: p3[0] - p2[0], y: p3[1] - p2[1] };
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    const angle = Math.acos(dotProduct / (magnitude1 * magnitude2));
    totalCurvature += angle;
  }
  return totalCurvature;
};

export const getElevation = async (coordinates, mapboxAccessToken) => {
  const elevations = [];
  const baseUrl = "https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/";
  for (let i = 0; i < coordinates.length; i += 100) {
    const [longitude, latitude] = coordinates[i];
    const url = `${baseUrl}${longitude},${latitude}.json?layers=contour&limit=50&access_token=${mapboxAccessToken}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      elevations.push(data.features[0]?.properties?.ele || 0);
    } catch (error) {
      console.error("Error fetching elevation data:", error);
    }
  }
  return elevations;
};

export const calculateRideability = (curvature, elevationDiff) => {
  const curvatureWeight = 0.6;
  const elevationWeight = 0.4;
  const normalizedCurvature = Math.min(curvature / 10, 1) * 10;
  const normalizedElevation = Math.min(elevationDiff / 500, 1) * 10;
  return (curvatureWeight * normalizedCurvature) + (elevationWeight * normalizedElevation);
};

export const fetchPlacesAlongRoute = async (stepCoordinates, googleApiKey) => {
  const places = { gas: [], food: [], coffee: [] };
  const radius = 1000;
  const RESOURCE_TYPES = { gas: 'gas_station', food: 'restaurant', coffee: 'cafe' };
  const sampledCoords = stepCoordinates.filter((_, i) => i % 100 === 0);

  for (const coord of sampledCoords) {
    for (const [key, type] of Object.entries(RESOURCE_TYPES)) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coord[1]},${coord[0]}&radius=${radius}&type=${type}&key=${googleApiKey}`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.results) {
          for (const place of json.results) {
            if (!places[key].some(p => p.place_id === place.place_id)) {
              places[key].push({
                place_id: place.place_id,
                name: place.name,
                address: place.vicinity,
                rating: place.rating,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                mapsLink: `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat},${place.geometry.location.lng}`,
              });
            }
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${key} at ${coord}`, err);
      }
    }
  }
  return places;
};

export function formatRoadsideSummary(data) {
  const counts = { gas: 0, food: 0, coffee: 0 };
  const grouped = { gas: [], food: [], coffee: [] };
  Object.entries(data).forEach(([cat, items]) => {
    if (counts[cat] !== undefined) {
      counts[cat] += items.length;
      grouped[cat].push(...items);
    }
  });
  const detailed = {};
  Object.keys(grouped).forEach(cat => {
    detailed[cat] = grouped[cat]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3)
      .map(item => ({
        name: item.name,
        rating: item.rating || null,
        mapsLink: item.mapsLink
      }));
  });
  return { summary: { ...counts }, detailed };
}

export const getTripWeatherSummary = async (locations) => {
  let averageTemp = 0, averageWind = 0, apiCalls = 0;
  let minTemp = Infinity, maxTemp = -Infinity;
  const iconCounts = { "☀️": 0, "🌤": 0, "🌥": 0, "☁️": 0, "🌧": 0, "🌦": 0, "❄️": 0, "🌨": 0, "🌫": 0, "🌁": 0, "❓": 0 };
  const snapshots = [];

  for (let i = 0; i < locations.length; i += 4) {
    const { latitude, longitude, timestamp } = locations[i];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,windspeed_10m,weathercode&timezone=UTC`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const index = data.hourly.time.findIndex(t => t.startsWith(new Date(timestamp).toISOString().slice(0, 13)));
      if (index !== -1) {
        const temp = data.hourly.temperature_2m[index];
        const wind = data.hourly.windspeed_10m[index];
        const icon = mapWeatherCodeToIcon(data.hourly.weathercode[index]);
        averageTemp += temp;
        averageWind += wind;
        minTemp = Math.min(minTemp, temp);
        maxTemp = Math.max(maxTemp, temp);
        iconCounts[icon] += 1;
        apiCalls++;
        snapshots.push({
          lat: latitude,
          lon: longitude,
          timestamp,
          temp: temp * 1.8 + 32,
          wind,
          icon
        });
      }
    } catch (error) {
      console.error("Forecast API error:", error);
    }
  }

  const popularIcon = Object.entries(iconCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  return {
    average_temperature: apiCalls ? (averageTemp / apiCalls) * 1.8 + 32 : 0,
    min_temperature: minTemp !== Infinity ? (minTemp * 1.8 + 32) : null,
    max_temperature: maxTemp !== -Infinity ? (maxTemp * 1.8 + 32) : null,
    average_wind_speed: apiCalls ? averageWind / apiCalls : 0,
    icons: popularIcon,
    snapshots
  };
};

// Optimize polyline rendering
export const renderMultiColorPolyline = (geometryCoords, congestionLevels) => {
  if (!geometryCoords || geometryCoords.length < 2 || !congestionLevels) return null;

  const segments = [];
  const downsampleStep = 2; // Adjust downsampling factor if needed

  for (let i = 1; i < geometryCoords.length; i += downsampleStep) {
    const prevCoord = geometryCoords[i - 1];
    const currCoord = geometryCoords[i];
    const congestion = congestionLevels[i - 1] || 'unknown';

    segments.push({
      coordinates: [
        { latitude: prevCoord[1], longitude: prevCoord[0] },
        { latitude: currCoord[1], longitude: currCoord[0] },
      ],
      color: getCongestionColor(congestion),
    });
  }
  return segments;
};

export const preRouteAnalysis = async (origin, destination, mapboxAccessToken) => {
  const baseUrl = "https://api.mapbox.com/directions/v5/mapbox/driving-traffic";
  const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
  const params = new URLSearchParams({
    overview: "full",
    steps: "true",
    alternatives: "true",
    annotations: "distance,duration,speed,maxspeed,congestion",
    geometries: "geojson",
    voice_instructions: "true",
    banner_instructions: "true",
    access_token: mapboxAccessToken,
  });

  try {
    const response = await fetch(`${baseUrl}/${coordinates}?${params}`);
    if (!response.ok) {
      const text = await response.text();
      console.error("Mapbox returned error:", text.slice(0, 100));
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const allRoutes = data.routes.map((route) => {
      const legData = route.legs[0];
      const annotations = legData.annotation;
      const stepCoordinates = route.geometry.coordinates;
      const congestions = annotations.congestion;
      const maxSpeeds = annotations.maxspeed;

      const summary = {
        max_congestion: "",
        congestion_overview: [],
        max_speed: 0,
        max_speed_overview: [],
      };

      let prevCongestion = congestions[0];
      summary.congestion_overview.push([congestions[0], stepCoordinates[0]]);
      let prevMaxSpeed = maxSpeeds[0]?.speed ? maxSpeeds[0].speed * 0.62 : 0;

      for (let i = 0; i < congestions.length; i++) {
        const rawSpeed = maxSpeeds[i]?.speed;
        const currentSpeed = typeof rawSpeed === "number" ? rawSpeed * 0.62 : 0;
        if (prevMaxSpeed !== currentSpeed) {
          summary.max_speed_overview.push([currentSpeed, stepCoordinates[i]]);
          prevMaxSpeed = currentSpeed;
        }
        if (summary.max_speed < currentSpeed) summary.max_speed = currentSpeed;
        if (prevCongestion !== congestions[i]) {
          summary.congestion_overview.push([congestions[i], stepCoordinates[i]]);
          prevCongestion = congestions[i];
        }
      }

      summary.max_congestion = congestions.reduce((a, b, _, arr) =>
        arr.filter(v => v === a).length > arr.filter(v => v === b).length ? a : b
      );

      return {
        ...summary,
        stepCoordinates,
        polyline_coordinates: congestions,
      };
    });
    return allRoutes;
  } catch (error) {
    console.error('Error during preRouteAnalysis:', error);
    throw error;
  }
};

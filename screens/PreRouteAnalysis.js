import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';

import { ThemeContext } from './ThemeCustomization'; // ✅ Add this line

import SearchInput from '../components/SearchInput';
import SummarySection from '../components/SummarySection';
import MapSection from '../components/MapSection';
import RideConditions from '../components/RideConditions';
import RideResources from '../components/RideResources';

import {
  getCongestionColor,
  preRouteAnalysis,
  getTripWeatherSummary,
  fetchPlacesAlongRoute,
  formatRoadsideSummary,
  calculateCurvature,
  getElevation,
  calculateRideability,
  renderMultiColorPolyline,
} from '../utils/analysisUtils';

const USE_MOCK = false;
const googleApiKey = 'AIzaSyBT6nc18rrT6YZrEghVzSGYUoXSiI23oIA';

export default function PreRouteAnalysis() {
  const { theme } = useContext(ThemeContext);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState({
    latitude: 38.5449,
    longitude: -121.7405,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [routes, setRoutes] = useState([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [resources, setResources] = useState(null);
  const [rideabilityScore, setRideabilityScore] = useState(null);
  const [showSpeedBubbles, setShowSpeedBubbles] = useState(false);
  const [showPolyline, setShowPolyline] = useState(false);
  const [polylines, setPolylines] = useState(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchTimeout = useRef(null);
  const scrollViewRef = useRef(null);
  const detailsRef = useRef(null);
  const weatherRef = useRef(null);
  const roadRef = useRef(null);
  const rideRef = useRef(null);

  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2FpbGkta2Fya2FyZSIsImEiOiJjbTl0OTZtOTIwOGpuMmlwenY5cHM5dDNlIn0.tSQUU1UtswIIfIPe7jBpzg';
  const milesToDegrees = (miles) => miles / 69.0;

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        });
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
    fetchLocation();
  }, []);

  const handleSearch = async (text) => {
    setQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.length < 3) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        const delta = milesToDegrees(100);
        const minLon = userLocation.lon - delta;
        const maxLon = userLocation.lon + delta;
        const minLat = userLocation.lat - delta;
        const maxLat = userLocation.lat + delta;
        const viewbox = `${minLon},${minLat},${maxLon},${maxLat}`;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=5&viewbox=${viewbox}&bounded=1`
        );
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  };

  const handleSelect = (item) => {
    setQuery(item.display_name);
    setResults([]);
    setLatitude(parseFloat(item.lat));
    setLongitude(parseFloat(item.lon));
  };

  const handleSubmit = async () => {
    setLoading(true);
    Keyboard.dismiss();
    setError(null);
    setResponse(null);

    try {
      const parsedLat = latitude;
      const parsedLon = longitude;
      if (isNaN(parsedLat) || isNaN(parsedLon)) {
        setError('Please enter valid numbers for latitude and longitude.');
        setLoading(false);
        return;
      }
      const origin = userLocation ? [userLocation.lon, userLocation.lat] : [-121.7405, 38.5449];
      const destination = [parsedLon, parsedLat];
      const result = USE_MOCK
        ? await preRouteAnalysisMock(origin, destination)
        : await preRouteAnalysis(origin, destination, MAPBOX_ACCESS_TOKEN);

      const cleanedRoutes = result.map((route) => ({
        maxCongestion: route.max_congestion,
        maxSpeed: route.max_speed,
        congestionOverview: route.congestion_overview,
        maxSpeedOverview: route.max_speed_overview,
        stepCoordinates: route.stepCoordinates,
        congestionLevel: route.polyline_coordinates,
      }));

      setResponse(cleanedRoutes[0]);
      setRoutes(cleanedRoutes);
      setCurrentRouteIndex(0);
      setRegion({
        latitude: parsedLat,
        longitude: parsedLon,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      setPolylines(renderMultiColorPolyline(cleanedRoutes[0].stepCoordinates, cleanedRoutes[0].congestionLevel));

      const locations = cleanedRoutes[0].congestionOverview.map(([_, coords]) => ({
        latitude: coords[1],
        longitude: coords[0],
        timestamp: new Date().toISOString(),
      }));
      const weather = await getTripWeatherSummary(locations);
      setWeatherSummary(weather);

      const roadsideResources = await fetchPlacesAlongRoute(cleanedRoutes[0].stepCoordinates, googleApiKey);
      const formattedResources = formatRoadsideSummary(roadsideResources);
      setResources(formattedResources);

      const curvature = calculateCurvature(cleanedRoutes[0].stepCoordinates);
      const elevations = await getElevation(cleanedRoutes[0].stepCoordinates, MAPBOX_ACCESS_TOKEN);
      const maxElevation = Math.max(...elevations);
      const minElevation = Math.min(...elevations);
      const elevationDiff = maxElevation - minElevation;
      const score = calculateRideability(curvature, elevationDiff);

      setRideabilityScore({ curvature, maxElevation, minElevation, score });
    } catch (err) {
      setError('Location is too far away or is invalid. Please choose a different location.');
      console.error('Detailed error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.header}>Ride Preview</Text>

      <SearchInput
        query={query}
        results={
          searchLoading
            ? [{ display_name: 'Searching...', isLoading: true }]
            : results
        }
        onSearchChange={handleSearch}
        onSelectResult={handleSelect}
        loading={searchLoading}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Analyze</Text>}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {response && (
        <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <SummarySection
            response={response}
            weatherSummary={weatherSummary}
            rideabilityScore={rideabilityScore}
            resources={resources}
            scrollToDetails={() => detailsRef.current?.measureLayout(scrollViewRef.current, (_, y) => scrollViewRef.current.scrollTo({ y, animated: true }))}
            scrollToWeather={() => weatherRef.current?.measureLayout(scrollViewRef.current, (_, y) => scrollViewRef.current.scrollTo({ y, animated: true }))}
            scrollToRide={() => rideRef.current?.measureLayout(scrollViewRef.current, (_, y) => scrollViewRef.current.scrollTo({ y, animated: true }))}
            scrollToRoad={() => roadRef.current?.measureLayout(scrollViewRef.current, (_, y) => scrollViewRef.current.scrollTo({ y, animated: true }))}
          />

          <MapSection
            region={region}
            showPolyline={showPolyline}
            polylines={polylines}
            showSpeedBubbles={showSpeedBubbles}
            response={response}
            setShowPolyline={setShowPolyline}
            setShowSpeedBubbles={setShowSpeedBubbles}
          />

          <RideConditions
            response={response}
            weatherSummary={weatherSummary}
            rideabilityScore={rideabilityScore}
            detailsRef={detailsRef}
            weatherRef={weatherRef}
            rideRef={rideRef}
          />

          <RideResources
            resources={resources}
            roadRef={roadRef}
          />

          {/* {routes.length > 1 && (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: '#fff', marginBottom: 10 }}>
                {routes.length - 1} alternate route(s) available
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.accent }]}
                onPress={() => {
                  const nextIndex = (currentRouteIndex + 1) % routes.length;
                  setCurrentRouteIndex(nextIndex);
                  setResponse(routes[nextIndex]);
                }}
              >
                <Text style={styles.buttonText}>Find Another Route</Text>
              </TouchableOpacity>
            </View>
          )} */}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#1E90FF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  errorText: { color: '#ff6b6b', textAlign: 'center', marginTop: 15 },
  scrollView: { flex: 1, marginTop: 20 },
  scrollContent: { paddingBottom: 20 },
});

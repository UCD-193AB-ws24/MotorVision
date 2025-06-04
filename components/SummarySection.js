import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SummarySection({
  response,
  weatherSummary,
  rideabilityScore,
  resources,
  scrollToDetails,
  scrollToWeather,
  scrollToRide,
  scrollToRoad,
}) {
  const getCongestionEmoji = (level) => {
    switch (level) {
      case 'low': return '🟢';
      case 'moderate': return '🟡';
      case 'heavy': return '🟠';
      case 'severe': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Summary</Text>

      {/* Traffic & Road */}
      <TouchableOpacity onPress={scrollToDetails}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Traffic & Road</Text>
          <Text style={styles.cardText}>
            Average Congestion: <Text style={styles.cardValue}>
              {response?.maxCongestion ?? 'N/A'} {getCongestionEmoji(response?.maxCongestion)}
            </Text>
          </Text>
          <Text style={styles.cardText}>
            Max Speed Allowed: <Text style={styles.cardValue}>
              {response?.maxSpeed?.toFixed?.(2) ?? 'N/A'} mph
            </Text>
          </Text>
        </View>
      </TouchableOpacity>

      {/* Weather */}
      <TouchableOpacity onPress={scrollToWeather}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weather</Text>
          {weatherSummary ? (
            <>
              <Text style={styles.cardText}>
                Avg Temperature: <Text style={styles.cardValue}>
                  {weatherSummary.average_temperature?.toFixed(1)}°F
                </Text>
              </Text>
              <Text style={styles.cardText}>
                Avg Windspeed: <Text style={styles.cardValue}>
                  {weatherSummary.average_wind_speed?.toFixed(1)} mph
                </Text>
              </Text>
              <Text style={styles.cardText}>
                Common Weather: <Text style={styles.cardValue}>
                  {weatherSummary.icons}
                </Text>
              </Text>
            </>
          ) : (
            <Text style={styles.cardValue}>Loading weather data...</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Rideability */}
      <TouchableOpacity onPress={scrollToRide}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rideability</Text>
          {rideabilityScore ? (
            <>
              <Text style={styles.cardText}>
                Curvature Score: <Text style={styles.cardValue}>
                  {rideabilityScore.curvature?.toFixed?.(2) ?? 'N/A'}
                </Text>
              </Text>
              <Text style={styles.cardText}>
                Elevation Δ: <Text style={styles.cardValue}>
                  {(rideabilityScore.maxElevation - rideabilityScore.minElevation).toFixed(1)} ft
                </Text>
              </Text>
              <Text style={styles.cardText}>
                Overall Score: <Text style={styles.cardValue}>
                  {rideabilityScore.score?.toFixed?.(1) ?? 'N/A'} / 10
                </Text>
              </Text>
            </>
          ) : (
            <Text style={styles.cardValue}>Loading rideability data...</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Roadside Resources */}
      <TouchableOpacity onPress={scrollToRoad}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Roadside Resources</Text>
          {resources?.summary ? (
            Object.entries(resources.summary).map(([key, count]) => (
              <Text key={key} style={styles.cardText}>
                {key.charAt(0).toUpperCase() + key.slice(1)}: <Text style={styles.cardValue}>{count}</Text>
              </Text>
            ))
          ) : (
            <Text style={styles.cardValue}>Loading roadside data...</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  card: {
    backgroundColor: '#2B2B2B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#cccccc',
    marginBottom: 3,
  },
  cardValue: {
    fontWeight: 'normal',
    color: '#99ccff',
  },
});

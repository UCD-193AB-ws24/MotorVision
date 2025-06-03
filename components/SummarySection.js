// components/SummarySection.js

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
      case 'low':
        return '🟢';
      case 'moderate':
        return '🟡';
      case 'heavy':
        return '🟠';
      case 'severe':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.headerTitle}>Summary</Text>

      <TouchableOpacity onPress={scrollToDetails}>
        <View style={styles.resultBox}>
          <Text style={styles.sectionTitle}>Traffic and Road Conditions</Text>
          <Text style={styles.titleText}>
            Average Congestion: {' '}
            <Text style={styles.summaryText}>
              {response?.maxCongestion} {getCongestionEmoji(response?.maxCongestion)}
            </Text>
          </Text>
          <Text style={styles.titleText}>
            Max Speed Allowed: {' '}
            <Text style={styles.summaryText}>
              {response?.maxSpeed ? response.maxSpeed.toFixed(2) : 'N/A'} mph
            </Text>
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity onPress={scrollToWeather}>
        <View style={styles.resultBox}>
          <Text style={styles.sectionTitle}>Weather Conditions</Text>
          {weatherSummary ? (
            <>
              <Text style={styles.titleText}>
                Average Temperature: {' '}
                <Text style={styles.summaryText}>{weatherSummary.average_temperature?.toFixed(1)}°F</Text>
              </Text>
              <Text style={styles.titleText}>
                Average Windspeed: {' '}
                <Text style={styles.summaryText}>{weatherSummary.average_wind_speed?.toFixed(1)} mph</Text>
              </Text>
              <Text style={styles.titleText}>
                Most Common Weather: {' '}
                <Text style={styles.summaryText}>{weatherSummary.icons}</Text>
              </Text>
            </>
          ) : (
            <Text style={styles.summaryText}>Loading weather data...</Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity onPress={scrollToRide}>
        <View style={styles.resultBox}>
          <Text style={styles.sectionTitle}>Riding Conditions</Text>
          {rideabilityScore ? (
            <>
              <Text style={styles.titleText}>
                Rideability Score: {' '}
                <Text style={styles.summaryText}>
                  {rideabilityScore.curvature?.toFixed?.(2) ?? "N/A"} 🏍️
                </Text>
              </Text>
            </>
          ) : (
            <Text style={styles.summaryText}>Loading riding data...</Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity onPress={scrollToRoad}>
        <View style={styles.resultBox}>
          <Text style={styles.sectionTitle}>Roadside Resources</Text>
          {resources?.summary ? (
            Object.entries(resources.summary).map(([key, count]) => (
              <Text key={key} style={styles.titleText}>
                {key.charAt(0).toUpperCase() + key.slice(1)}: {' '}
                <Text style={styles.summaryText}>{count}</Text>
              </Text>
            ))
          ) : (
            <Text style={styles.summaryText}>Loading roadside resources...</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 35,
    fontWeight: 'bold',
    paddingLeft: 10,
    marginTop: 10,
    color: 'white',
  },
  resultBox: {
    backgroundColor: '#1E1E1E',
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    paddingLeft: 10,
    paddingTop: 6,
  },
  titleText: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 5,
    fontWeight: 'normal',
    paddingLeft: 10,
  },
  divider: {
    height: 1,
    width: '85%',
    backgroundColor: '#ccc',
    marginVertical: 12,
    alignSelf: 'center',
  },
});

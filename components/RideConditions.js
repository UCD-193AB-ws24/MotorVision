// components/AnalysisDetailsSection.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getCongestionColor } from '../utils/analysisUtils';

export default function RideConditions({
  response,
  weatherSummary,
  rideabilityScore,
}) {
  return (
    <>
      {/* Congestion Overview */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Congestion Overview</Text>
        <View style={styles.overviewList}>
          {Object.entries(
            response.congestionOverview.reduce((acc, [level]) => {
              acc[level] = (acc[level] || 0) + 1;
              return acc;
            }, {})
          ).map(([level, count], index) => {
            const total = response.congestionOverview.length || 1;
            const percentage = ((count / total) * 100).toFixed(2);
            return (
              <View key={index} style={styles.congestionItem}>
                <View
                  style={[
                    styles.legendColorBox,
                    { backgroundColor: getCongestionColor(level) },
                  ]}
                />
                <Text style={styles.congestionText}>
                  {level} {percentage}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Weather Charts */}
      {weatherSummary && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Temperature Overview</Text>
          <LineChart
            data={{
              labels: weatherSummary.snapshots.map(() => ''),
              datasets: [
                {
                  data: weatherSummary.snapshots.map((snap) => snap.temp),
                  color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // red
                  strokeWidth: 2,
                },
              ],
              legend: ['Temperature (°F)'],
            }}
            width={Dimensions.get('window').width * 0.8}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />

          <Text style={styles.sectionTitle}>Wind Speed Overview</Text>
          <LineChart
            data={{
              labels: weatherSummary.snapshots.map(() => ''),
              datasets: [
                {
                  data: weatherSummary.snapshots.map((snap) => snap.wind),
                  color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // blue
                  strokeWidth: 2,
                },
              ],
              legend: ['Wind Speed (mph)'],
            }}
            width={Dimensions.get('window').width * 0.8}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Rideability Section */}
      {rideabilityScore && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Riding Conditions</Text>
          <View style={styles.ridingDetails}>
            <Text style={styles.detailText}>
              Maximum Elevation:{' '}
              <Text style={styles.detailValue}>
                {rideabilityScore.maxElevation}
              </Text>
            </Text>
            <Text style={styles.detailText}>
              Minimum Elevation:{' '}
              <Text style={styles.detailValue}>
                {rideabilityScore.minElevation}
              </Text>
            </Text>
            <Text style={styles.detailText}>
              Average Curvature:{' '}
              <Text style={styles.detailValue}>
                {rideabilityScore.curvature?.toFixed?.(2) ?? 'N/A'}
              </Text>
            </Text>
          </View>
        </View>
      )}
    </>
  );
}

const chartConfig = {
  backgroundColor: '#1E1E1E',
  backgroundGradientFrom: '#1E1E1E',
  backgroundGradientTo: '#1E1E1E',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`,
  propsForDots: { r: '4', strokeWidth: '1', stroke: '#ffa726' },
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  overviewList: {
    marginTop: 5,
    paddingLeft: 12,
  },
  congestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 5,
  },
  congestionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 10,
  },
  ridingDetails: {
    marginTop: 8,
  },
  detailText: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailValue: {
    color: '#ffffff',
  },
});

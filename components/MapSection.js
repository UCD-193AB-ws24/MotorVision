// components/MapSection.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';

const SpeedBubble = ({ coordinate, speed, unit = 'mph' }) => {
  if (speed === null || isNaN(speed) || speed === 0) return null;

  const getBubbleColor = (speed) => {
    if (speed > 60) return '#2ecc71'; // green
    if (speed > 30) return '#f1c40f'; // yellow
    return '#e74c3c'; // red
  };

  const displaySpeed = speed === null ? 'N/A' : `${speed.toFixed(0)} ${unit}`;
  const bubbleColor = getBubbleColor(speed);

  return (
    <Marker coordinate={coordinate}>
      <View style={[styles.speedBubble, { backgroundColor: bubbleColor }]}>
        <Text style={styles.speedText}>{displaySpeed}</Text>
      </View>
    </Marker>
  );
};

export default function MapSection({
  region,
  showPolyline,
  polylines,
  showSpeedBubbles,
  response,
  setShowPolyline,
  setShowSpeedBubbles,
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Interactive Map</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={{ flex: 1 }}
          region={region}
          onRegionChangeComplete={(newRegion) => {}}
        >
          {showPolyline &&
            polylines?.map((segment, index) => (
              <Polyline
                key={`segment-${index}`}
                coordinates={segment.coordinates}
                strokeColor={segment.color}
                strokeWidth={6}
              />
            ))}

          {showSpeedBubbles &&
            response?.maxSpeedOverview.map(([speed, coords], index) => (
              <SpeedBubble
                key={`speed-bubble-${index}`}
                coordinate={{ latitude: coords[1], longitude: coords[0] }}
                speed={speed}
              />
            ))}
        </MapView>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={styles.ovalButton}
          onPress={() => setShowSpeedBubbles((prev) => !prev)}
        >
          <Text style={styles.ovalButtonText}>
            {showSpeedBubbles ? 'Hide Speed' : 'Show Speed'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ovalButton}
          onPress={() => setShowPolyline((prev) => !prev)}
        >
          <Text style={styles.ovalButtonText}>
            {showPolyline ? 'Hide Polyline' : 'Show Polyline'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    paddingLeft: 10,
    paddingTop: 6,
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 18,
  },
  ovalButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  ovalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  speedBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  speedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

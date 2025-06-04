// components/MapSection.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';

const SpeedBubble = ({ coordinate, speed, unit = 'mph' }) => {
  if (speed === null || isNaN(speed) || speed === 0) return null;

  const getBubbleColor = (speed) => {
    if (speed > 60) return '#2ecc71'; // green
    if (speed > 30) return '#f1c40f'; // yellow
    return '#e74c3c'; // red
  };

  const displaySpeed = `${speed.toFixed(0)} ${unit}`;
  const bubbleColor = getBubbleColor(speed);

  return (
    <Marker coordinate={coordinate}>
      <View style={[styles.speedBubble, { backgroundColor: bubbleColor }]}>
        <Text style={styles.speedText}>{displaySpeed}</Text>
      </View>
    </Marker>
  );
};

export default function MapSection({ region, polylines, response }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Interactive Map</Text>
      <View style={styles.mapContainer}>
        <MapView style={{ flex: 1 }} region={region}>
          {polylines?.map((segment, index) => (
            <Polyline
              key={`segment-${index}`}
              coordinates={segment.coordinates}
              strokeColor={segment.color}
              strokeWidth={6}
            />
          ))}

          {response?.maxSpeedOverview.map(([speed, coords], index) => (
            <SpeedBubble
              key={`speed-bubble-${index}`}
              coordinate={{ latitude: coords[1], longitude: coords[0] }}
              speed={speed}
            />
          ))}
        </MapView>
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

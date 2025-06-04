// components/RideResources.js

import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';

export default function RideResources({ resources }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Roadside Resources</Text>
      {resources?.detailed ? (
        Object.entries(resources.detailed).map(([category, places]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            {places.map((place, index) => (
              <View key={index} style={styles.placeContainer}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeRating}>
                  Rating: {place.rating ?? 'N/A'}
                </Text>
                <TouchableOpacity onPress={() => Linking.openURL(place.mapsLink)}>
                  <Text style={styles.linkText}>View on Maps</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))
      ) : (
        <Text style={styles.loadingText}>Loading roadside resources...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 16,
    padding: 4,
  },
  categoryTitle: {
    backgroundColor: '#2c2c2c',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
    color: '#ffffff',
    fontSize: 18,
  },
  placeContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeName: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 2,
  },
  placeRating: {
    color: '#cccccc',
    fontSize: 14,
  },
  linkText: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
    fontSize: 14,
    marginTop: 4,
  },
  loadingText: {
    color: '#cccccc',
    fontSize: 16,
  },
});

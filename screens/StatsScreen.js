import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Card } from "react-native-paper";
import { LineGraph } from './LineGraph'; 

// created with AI assistance
// Created a stat object. We can call this repeatedly.
class stat {
  constructor(title, value, unit, color, graphData) {
    this.title = title;
    this.value = value;
    this.unit = unit;
    this.color = color;
    this.graphData = graphData;
  }
}

// mock data I created
const stats = {
  Steps: new stat("Average Distance", "20 ft", "average distance", "#ff453a", {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: [20, 10, 5, 25, 20] }],
  }),
  Calories: new stat("Total Distance", "100 miles", "total distance", "#ff9f0a", {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: [25, 20, 30, 10, 15] }],
  }),
  Sleep: new stat("Average Speed", "40 mph", "sleep", "#5ac8fa", {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: [60, 50, 20, 50, 20] }],
  }),
};

export default function HealthStats() {
  const [selectedStat, setSelectedStat] = useState(null);

  const handleStatPress = (statKey) => {
    setSelectedStat(stats[statKey]); 
  };

  return (
    <ScrollView style={styles.container}>
      <View type="title" style={styles.header}>
        Summary
      </View>

      {Object.keys(stats).map((statKey) => {
        const stat = stats[statKey];
        return (
          <TouchableOpacity
            key={statKey}
            activeOpacity={0.7}
            onPress={() => handleStatPress(statKey)}
          >
            <Card style={[styles.card]}>
              <View style={styles.cardContent}>
                <Text style={[styles.title, { color: stat.color }]}>
                  {stat.title}
                </Text>
                <Text style={styles.value}>{stat.value}</Text>
                <Text style={styles.unit}>{stat.unit}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        );
      })}

      {selectedStat && (
        <View style={styles.graphContainer}>
          <LineGraph data={selectedStat.graphData} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
    padding: 10,
    marginTop: 60,
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'SFProDisplay-Bold',
  },
  container: {
    flex: 1,
    backgroundColor: "#121212", 
    padding: 20,
  },
  card: {
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1.5,
    shadowColor: "rgba(0, 0, 0, 0.7)",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardContent: {},
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  unit: {
    fontSize: 14,
    color: "#a1a1a1",
  },
  graphContainer: {
    marginTop: 30, 
  },
});

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Card } from "react-native-paper";
import { LineGraph } from './LineGraph'; 
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { database } from "../config/firebase";

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
  Average_Distance: new stat("Average Distance", "20 ft", "average distance", "#ff453a", {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: [20, 10, 5, 25, 20] }],
  }),
  Total_Distance: new stat("Total Distance", "100 miles", "total distance", "#ff9f0a", {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: [25, 20, 30, 10, 15] }],
  }),
  Average_Speed: new stat("Average Speed", "40 mph", "sleep", "#5ac8fa", {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: [60, 50, 20, 50, 20] }],
  }),
};

export default function HealthStats() {
  const navigation = useNavigation();
  const [selectedStat, setSelectedStat] = useState(null);





  const uploadGraphData = async (statKey, graphData) => {
    try {
      // Reference to the document inside "stats" collection
      const statRef = doc(database, "stats", statKey);
  
      // Upload data to Firestore
      await setDoc(statRef, { graphData }, { merge: true });
  
      console.log("Graph data uploaded successfully!");
    } catch (error) {
      console.error("Error uploading graph data:", error);
    }
  };

  const uploadStat = async (statKey, statObject) => {
    try {
      // Reference to the document inside "stats" collection
      const statRef = doc(database, "stats", statKey);
  
      // Upload the entire stat object to Firestore
      await setDoc(statRef, {
        title: statObject.title,
        value: statObject.value,
        unit: statObject.unit,
        color: statObject.color,
        graphData: statObject.graphData,  // Include the graphData as well
      }, { merge: true });
  
      console.log("Stat object uploaded successfully!");
    } catch (error) {
      console.error("Error uploading stat object:", error);
    }
  };


  const fetchStat = async (statKey) => {
    try {
      const statRef = doc(database, "stats", String(statKey)); // Convert to string
      const statSnap = await getDoc(statRef);

      if (statSnap.exists()) {
        console.log("Stat Data:", statSnap.data());
        return statSnap.data(); // Returns the document data
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching stat:", error);
      return null;
    }
  };

  const fetchStat2 = async (statKey) => {
    try {
      const statRef = doc(database, "stats", String(statKey)); // Convert to string
      const statSnap = await getDoc(statRef);
  
      if (statSnap.exists()) {
        const data = statSnap.data();  // Get the document data
        console.log("Stat Data:", data);
  
        // Reconstruct the stat object using the fetched data
        const fetchedStat = new stat(
          data.title,
          data.value,
          data.unit,
          data.color,
          data.graphData  // Use the graphData from Firestore
        );
  
        return fetchedStat;  // Return the fully reconstructed stat object
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching stat:", error);
      return null;
    }
  };

  const handleStatPress = async (statKey) => {
    // let response = await fetchStat(statKey);
    // console.log("this is the response: ", response);
    console.log("this is the key: ", statKey);
    // const selectedStat = await fetchStat2(statKey);
    const selectedStat = stats[statKey];
    // uploadStat(statKey, selectedStat);
    console.log("this is the selected stat: ", selectedStat);
    
    setSelectedStat(selectedStat);
    console.log("THIS IS THE SELECTED STAT 2: ", selectedStat);
    console.log("this is the GRAPH DATA: ", selectedStat.graphData);
    // uploadGraphData(statKey, selectedStat.graphData);
    // const selectedStat = stats[statKey]; 
    // Navigate to the LineGraph screen and pass the graph data
    navigation.navigate('StatDetails', { stat: selectedStat });
  };

  return (
    <ScrollView style={styles.container}>
      <View type="title" style={styles.headerTitle}>
        <Text style={styles.header}>Summary</Text>
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
{/* 
      {selectedStat && (
        <View style={styles.graphContainer}>
          <LineGraph data={selectedStat.graphData} />
        </View>
      )} */}
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
  headerTitle: {
    marginBottom: 10,
    padding: 10,
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

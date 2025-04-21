import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LineGraph } from "./LineGraph"; // Import your graph component
import { useRoute, useNavigation } from "@react-navigation/native";

export default function StatDetails() {
    const route = useRoute();  
    const navigation = useNavigation();
    const { stat } = route.params; 
    console.log("this is the stat: ", stat);

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={[styles.title, { color: stat.color }]}>{stat.title}</Text>
                <Text style={styles.value}>{stat.value}</Text>
            </View>
      
            <View>
                <LineGraph data={stat.graphData} color={stat.color} />
            </View>
            
            {/* Aesthetic Back Button */}
            <TouchableOpacity onPress={handleBackPress} style={styles.button}>
                <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212", 
    paddingHorizontal: 20, 
    paddingVertical: 30 
  },

  headerContainer: { 
    marginBottom: 30, 
    alignItems: "center", 
    marginTop: 30 
  },

  title: { 
    fontSize: 28, 
    fontWeight: "600", 
    color: "#ffffff", 
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "SFProDisplay-Bold" 
  },

  value: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: "#ffffff", 
    marginBottom: 5 
  },

  button: {
    backgroundColor: "#00bfff",
    paddingVertical: 12,  
    paddingHorizontal: 25,  
    borderRadius: 30, 
    marginTop: 20, 
    alignSelf: "center",  
    alignItems: "center", 
    justifyContent: "center",  
    elevation: 4,  
  },

  buttonText: {
    color: "#ffffff", 
    fontSize: 18, 
    fontWeight: "600", 
  },

  unit: { 
    fontSize: 18, 
    color: "#a1a1a1", 
    marginBottom: 30, 
    fontWeight: "300" 
  }
});

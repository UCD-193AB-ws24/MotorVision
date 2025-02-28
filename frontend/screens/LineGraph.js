import React from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';

// created with AI assistance


const LineGraph = ({data, color}) => {
  const { width } = Dimensions.get('window');
  // const route = useRoute();  
  // const { data } = route.params; 

  return (
    <View style={styles.container}>
      <LineChart
        data={data}
        width={width - 40} 
        height={250} 
        chartConfig={{
          backgroundColor: '#121212',  
          backgroundGradientFrom: '#121212', 
          backgroundGradientTo: '#121212',  
          decimalPlaces: 2, 
          color: (opacity = 1) => `${color}`, 
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, 
          style: {
            borderRadius: 16,  
            paddingRight: 0,
            paddingLeft: 0,
            paddingTop: 10,
            paddingBottom: 10,
          },
          propsForDots: {
            r: '3', 
            strokeWidth: '3', 
            stroke: `${color}`,  
            fill: `${color}`,  
          },
          propsForLabels: {
            fontSize: 12,  
            fontWeight: '500', 
          },
        }}
        bezier 
        fromZero={true} 
      />

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
});

export { LineGraph };

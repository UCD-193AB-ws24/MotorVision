import React from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// created with AI assistance

const { width } = Dimensions.get('window');

const LineGraph = ({ data }) => {
  return (
    <View style={styles.container}>
      <LineChart
        data={data}
        width={width - 40} 
        height={250} 
        chartConfig={{
          backgroundColor: '#1E2923',
          backgroundGradientFrom: '#08130D',
          backgroundGradientTo: '#1E2923',
          decimalPlaces: 2, 
          color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, 
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726', 
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

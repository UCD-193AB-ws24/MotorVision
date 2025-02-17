import { View, Text, Animated, Image, StyleSheet, Platform, PermissionsAndroid, ActivityIndicator } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TouchableOpacity } from 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from "react";
import Geolocation from "react-native-geolocation-service";

// rotating image function
const RotatingImage = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,  // 2 seconds per full rotation
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],  // Full rotation
  });

  return (
    <Animated.Image 
      source={{ uri: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAMAAzAMBIgACEQEDEQH/xAAcAAABBAMBAAAAAAAAAAAAAAAAAQIDBAUGBwj/xABKEAABAwIDBAcFAwcICwEAAAABAAIDBBEFEiEGMUFRBxMiYXGBkTJCUqGxFCPBFTNicpLR8AgkY3OCorLhJTRDRFODhJPS4vEW/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDuKEIQCEIQCEIQCwmO7U4NgRLcQrGtltfqWdp/oFiOkfa//wDOYZJFQ2kxORhMTB7g+I/gvO1TiWL1lRJLLGHSyOJc+VxLieZQdmxfpYd2hhdKyJn/ABag3P7I/etMxLbXHsVJDq+o6om9mu6pvo21/Na/h0ErqdsuJGPTtNaNAO/vUstTTt/NMMju7QeqBk7pHAZnmRzjoL2CI6eIazPJPwg2HyULnOfIHloaANGtuguPBBep6kUjy+kLoHnQuicWuPmNVYGO4iz2MTrmfq1Tx+Kw+VztS63ekc5rR7LnHvNgg2Om2yx+msIMarR/WSdZ/ius5QdKm0FMf502lq2D4mFjj5jT5LnL6mQey1jf7N/qoXVVRxlPk0fuQd2wrpbwmoIZidNPRuO97fvGX8tVu+F4vh+LQ9bhtXDUsHGN9yPEbwvJpqp/jv4tClo8VraGds9LM6KVu6SJxY4HxCD14hcH2V6ZK+hy0+0UTq6Dd9oYGtlaO8Cwd6A+K7Bs/tHhO0dIKnCK2OdvvNvZ7O4t3hBmEIQgEIQgEIQgEIQgEIQgLgb1RxjFKTB6GStr5RHDGNeZPIDiSrFXUQ0lNJU1MjY4Yml73u3NaN5Xn3b/AGtn2iri6MujoIiWwRu08yOZ+SDXscxXEcUxKprKmqa580hd7G4cBv5Kk19RmB6xhI/QUYJJ13qeJt0En3kzgZHEu5nh5KVsSfEzS6u09K6Y3PZZxKCmyJzzZjblTtowwZpDc8hwWUELIhlYLBQyNugxsjABoFUkasnKxVJWKjHPaoHtV57FXeyygpuamlqsOamZUEBapqKpq6CqZVUFRJTVDNRLG4tP+aWwTbN5oOybA9Lf2iaLDdqskb3ENjr2jK0nlIOH6w052XXmuDmgtIIO4jivH7WNPIrrvRDts+CWDZzF5S6N/Zop3+6eEZPf7vpxCDsiEgIO5KgEIQgEIQgEjtyVYzaPFY8GwWqr5LfdM7APvOOgHqUHO+lvaRr5PyLBLlgis+rcD7R3ho/jeuT4rMHMp48oaSzOWjhfcsjVYg6pqHvfPTSSPeZJBLvc5YOtqTVVRlyhosGgDdYICMbuauQt3KnFvWRpG53tB3IL9DT9YbnRo4c1lmgBtgLBVoSA0NboFYaUA4XUTmqdNcAgpSRqrJEsk5qhe0C5KoxMkXcq0jLLIVMjW6BY+V995QVZAAVA5TuF0wtOqCs5p5qMjuVktOvcmOaoICXDcSrNNXOjLWvaTYghwNiDwI71A5tkwhB6f6OdqGbTYCyV8ofVwWjn5k8HW7/qtsXnDofqZ6ba6ibTyuY2dzo5m30e3KTqPEL0cECoQhAIQhAh3LlnTfjDYaKkw5kjbkmV4v8A2R9XfJdLxGqZQ0FRVyEBkMbpCT3C64sJIcJ6I8S2hxeNk2I43M99N11nmMyXDA0nk0Od6oOWSPJeb3SscL63WI+0StGjyfFK2tnHvD0QZ6J1yslSPAtzWqsxORhuY2H1VqLHS326Vh/VeR+9BukEo5q2yQFaVHtKxmn2J/8A3/8A1Vhu1zG7sPef+oH/AIINyD7i/BIXei0522cvu4bT+LpHk/IgfJQy7Y1bgerpKVnk531KDcZZgz96xlTVZiQw5vBatNtPicoP3kTCfejiDSqE2J1s352pkd52QbPLKRcvuB3rF1GJRsNmgOPPMsG+R8hu9znHm43RfQBBkJcVlI+7DWn1Kg+31N7mQk+J+m5QFuVocRvQGXB7kGXoK41DhDKGiQ+y4cVefHZa1GSxzXjSxB0W3ZbxNcd5AKDHStsq7tFdnbZVHqjYtgKv7HtNh8t7BtRHc8gXAH5Er1MvIWDOIrW5TZx0B5FetqGcVVFBUt3TRteLd4uoJ0IQgEIQg07pbrXUewGKiNuaSoY2mY3i4yODdPVc86acuF7I7KYDFYMYOsc3lkYGj/G5bn0p/wA9r9lMDDiDW4oJXW+CMXN+67mrm3T5Wio21hpR/ulI1v7RLv3IOaS04ffLoeCpvaWOyuFiFkhuUc0YkYb7wN6DHoQhApN0XKRCBcxtZIhCAQhCASpEoQSPkLmNafd3J7ckcLgXXedwChKS6CzQxdfO1liRqTZba5uWNreACwWz0OaR0pG85R9Ss9KUFCoCpP3q7UFUXcVRNhr8lXEeTgvVeyT+s2Ywp191JG30aB+C8nU7i2VpHAr1N0fyibZDDXjhGQfJxUGxIQhAJDuSoKDn1dmxPpow+AEOhwrCnzEcnyOI+mRcP6Ra/wDKW3OM1IkL2faDGw8g3S3rddq2Wl6zbHbvH5LZICykjdw+7ac30YvO007quomqXizp5HSEDgXEn8UA1JJ+bd4JE2d+WI9+iCghKUiAQhCAQhCAQlQUCJW2vruQEIHPABsNe9DG3tYEk6DvTRpqsnhNL1z+uf7DUGZwuAQUzWAX03/FzP8AHABWZCmsdppuUVTLogqVTrmw4qu8WapG9t/WHcNAmSlBGzR4XpPodfNJsNTSz37csmS590G31BXmlzgxpcdwF16w2Gww4PshhFA9uWWKkZ1o5PIzP/vEoM6hCEAo55WwQSSv9mNpcfAC6kWC25rvybsfi9WN8dK8jv0sg5tS1H5O6FcfxR7ndZitTUPvfW73iJvyaCuIgacl2HpRf+ROifZjBcwZJL1fWMt7QYy7v7xb6riTpHHigsPnDdALlVnvc83cU1CAQhCAQhCASoQgEiVFja6ACOKdFG+V2SNpc47g0XKyNPhwaQ6qcP6thufM8EEFDSPqXD3Ywe047h/H8c1nIw1gDGdljdw5qDO0AAANa3cBoAnNLneyL+CCd01lVkLnm19E9wtv1Kbo3cgD2W2VaVyleVA8oMzsRhP5d2twrDiwOikqGvmBFx1be04HxAt5r1kFwX+T9hpn2gr8Re2wp6bq2Hvedfk0LvSBUIQgFpXS0es2WZQBxBr62nprDiHPGb5XW6rQukCvoxtFspQ1MjWBuIfaJC9wAa0MeBe/f9EHNf5Rdbmx3CMMGraSi6y9+L3Wt6Rj1XI1uvTBiLMT6QcUlikD44y2FpabjstA087rS7IAIRZB0QIhSRxSTG0THvdya0lWosJrpRdtO4c8xAI8jqgpWSgeAWYjwJzRepq4Yxwtd3/xSCmwmDVz5Z3cr2Hy0PqEGDt4KxDQ1UwBjhdY7nHQHwvvWVNdDFpSUcUQ4OtYjz9r+8oJKueQuzSOs72g3sg+Nt/mgibhYZ/rM8bPDUp7IKRg7MbpCOL9Pko2u+G1+Cv0mE1lU3Nk6tnxPQQiewysDWN5NFk6GOWodlhY4jnwWR+x4bQDNUSfaJB7o9lQVGJukbkhaIo/haLIA00dOL1D7n4WlNknzdmMBjeTVUuSdU4FBLeya5ybmTSgHFR9W+R4a0au0T95sBcqalYDKGtN76E/gER3PoEpWwbPVzxqX1PtW36LqC1zo/w2PDNlMPijYGmSPrX/AKRdrf0stjRQhCEAuD9O0Ms+1ETXxNkpxQRuaCdQ7PJe1u6y7wuA9P8AUyx7U0jIXuYRQt1He56Dl/U0rey9j4j+k7VK2nouE5B7w0/gknhZJYOkJIGpKjbSRZhZxJCC42mpmi4fm/5bP3JzXtY77uKMW3ODAD6iyA0gahDW2FkD31c7tC6479fqonyyv9qV580pam5STYBBE4Zj2tfFNy66K4ylJ/OOA8FO3qItzQfFBQio55nWYzzOivw4PGLOqp8vc1JJWutlboO5VJJ5HHVxKDLirw7Dxakp2PePffqVQrMXqak2z2byGioG97osUCElx1JPmnC6c1qlbEUDGgp4aVOyHvA8VJ1XZvw58EFTKUBhPcnyTQx6ZusceEeo9VZwXAse2nqRBgtBLKwkAvaMsbRzc86IMbNKyIEX17jr/kt36M+j/E9p62Cuq2vpcHY7M6Qizpv0WDv+L6rfdiuhnD8MMdZtHK3EKsWcIGaQMP1f52HcuqxxsiY1kbQ1rRYNaLAICKNsTGsjaGsaLNaNwCehCAQhCAXDP5Q+HSsxDCsUDbwyRmnceAeDmaPMF3ou5rVOk3BZMd2LxGkgYJKhrRLCOOZuo+iDy7HC99yRlF76q0wBmjB3FxTGPc4AFpFtNRuTwdEC95380IugIADNopBZnim3yjRMJugc55KjcbpSUwoGlMO9OKagRPa3kE0m2/K0fpJj6ljR2Gkkbi42CC5Ey5sLk8gLpzqiCEdqVt+Tdf8AJTYJs3tDtS8R4XQTTRE6yZckI8XHQ/Mrp+zfQa1vVy7R4iXfFT0ug8M29ByV+ISPkbHSREvcbNFszj4Bbhs90W7VY+GzVzBh1MdesrPbt3R8POy75gGy+B7PR5cIw6CnduMgbd58XHVXuudLK9jHWDHZTY63QaJs50Q7N4WWSV4fidSLEmoNmfsD8V0Knp4aWFsNNEyKJvssjaGgeQVPJN9o7OjNBp5387rIDcgLJUhTTI1o1cED0KB1SB7LXE+ioVeIvY/KSWDKXOLRfK0cSUGWQqlBO6VpDnZrDR3NW0AkO5KhB5+6YNjzgWKHGaCL/Rla/wC8DRpBMfo13DvuOS53cjwXrrFcPpcVw+ehroRLTTsLHsPELzFt1svPshjjqCaTraeQGWmltbOy+4943FBggU66hDgd30RcncLoJC66bdJ2jwAQbNF3vDQgVIsnh2A4pij8uH4bV1J09mI29dAtywnoh2krcrqv7LQM/pXZ3fst+hIQc4NuR9UtPTVdbP1FFTyzSHcyBhcfku+4L0M4FSFr8VqanEpBrlP3MRP6rTfyLit9wvCMOwmFsOG0MFLGOEUYag8/bPdDe0eKFsuI9XhsLtT1pzSegXUdneiTZfBSyWopnYlUj/aVfaaD3M3et1v6EDIYo4YxHExrGNFg1oAA8AnoQgRY6kbma8nXM95173FZFxsCeSpUYtTxD9EIHCMiQm51AsOSmN+ZTmtQgjskI1UhTSghfxudFQqIYqiR8fWaluWYNsbt5H1WRcALki6rspmCZz42BsklsxA3oJ8OZlEhFstwAP48lcTI2BjQ0cE9AIQhAhWubabHYbthRRwYh1sUsLs0FRFYPjJ3794PIrZEIOMO6CndZ2NoyI+TqO59c4+itU3QZQtdepx6teP6KJjPqCuuoQc7oehzZWnt17a2rI1vLUEX8Q2wWy4Zsbs5hZvQ4NRxO+LqgSfVZ9CBkbGxtyxtDWjcALBPQhAIQhAIQhAIQhBFVOy08rhwYT8k2JgY0cdNE6pZ1sEkYNi5paD4iygbX0xlMTpo2SDexzgCEFpIk6xnxt9UF4O6/ogEx2hTiHncLeKUR/F2voghALz2Rcc1PHGI92p5p1kqAQhCD//Z" }}  
      style={[styles.helmetImage, { transform: [{ rotate: spin }] }]}
    />
  );
};

// live loc

const LocationView = () => {
    const [location, setLocation] = useState<{
      latitude: number;
      longitude: number;
      accuracy: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const requestPermissionAndGetLocation = async () => {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                setError("Location permission denied");
                setLoading(false);
                return;
            }

            Geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    });
                    setLoading(false);
                },
                (error) => {
                    setError(error.message);
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        };

        requestPermissionAndGetLocation();
    }, []);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // iOS handles permissions in Info.plist
    };

    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            {loading && <ActivityIndicator size="large" />}
            {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
            {location ? (  // ✅ Check if location exists before rendering
                <View>
                    <Text>📍 Current Location:</Text>
                    <Text>Latitude: {location.latitude}</Text>
                    <Text>Longitude: {location.longitude}</Text>
                    <Text>Accuracy: ±{location.accuracy} meters</Text>
                </View>
            ) : (
                !loading && <Text>No location data available.</Text> // ✅ Handle case when location is still null
            )}
        </View>
    );
};


export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title"> MotorVision Application </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Current Location:</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12'
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView>
        <LocationView />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle"> Connect to a Device </ThemedText>
      </ThemedView>
      <ThemedView style={styles.bodyContainer}>
        <ThemedText type="defaultSemiBold"> SmartHelmet </ThemedText>
      </ThemedView>
      <ThemedView style={styles.helmetContainer}>
        <RotatingImage />
      </ThemedView>
    </ParallaxScrollView>
  );
}


const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 50,
    fontWeight: "bold",
    justifyContent: "center",
    flex: 1,
  },
  stepContainer: {
    marginTop: 5,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 30,
    fontWeight: "bold",
    justifyContent: "center",
    flex: 1,
  },
  helmetContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    flex: 1,
  },
  bodyContainer: {
    marginTop: 5,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    flex: 1,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  helmetImage: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

});

import React, {useState, useEffect, useRef, useContext} from "react";
import {StyleSheet, View, Text, TouchableOpacity} from "react-native";
import MapView, {Marker, Callout} from "react-native-maps";
import * as Location from 'expo-location'
import { ThemeContext } from '../components/ThemeContext';

export default function MapScreen({route, navigation}) {
    const [boulderHalls, setBoulderHalls] = useState([]);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locationPermission, setLocationPermission] = useState(false);
    const mapRef = useRef(null);
    const { darkMode } = useContext(ThemeContext);

    const selectedHall = route.params?.selectedHall;

    useEffect(() => {
        // Get location permission and user location
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                setLocationPermission(status === 'granted');

                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });

                    // If there's no selectedHall, focus on user's current location
                    if (!selectedHall && mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }, 1000);
                    }
                }
            } catch (err) {
                console.error("Error getting location:", err);
                setError('Failed to get your location: ' + err.message);
            }
        })();

        fetchBoulderHalls();
    }, []);

    useEffect(() => {
        if (selectedHall && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: selectedHall.latitude,
                longitude: selectedHall.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        }
    }, [selectedHall, boulderHalls]);

    const fetchBoulderHalls = async () => {
        try {
            const response = await fetch('https://wesleynederpel.github.io/BoulderhallData/boulderhalls.json');

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setBoulderHalls(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching boulder halls:', err);
        }
    };

    const initialRegion = userLocation ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : {
        latitude: 52.1326,
        longitude: 5.2913,
        latitudeDelta: 3.0,
        longitudeDelta: 3.0,
    };

    return (
        <View style={[styles.container, darkMode ? styles.darkContainer : null]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={locationPermission}
                showsMyLocationButton={true}
                userInterfaceStyle={darkMode ? 'dark' : 'light'}
            >
                {boulderHalls.map((hall, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: hall.latitude,
                            longitude: hall.longitude,
                        }}
                        title={hall.name}
                        description={`${hall.city}, ${hall.province}`}
                    >
                        <Callout>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{hall.name}</Text>
                                <Text>{hall.city}, {hall.province}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    callout: {
        width: 150,
        padding: 5,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    darkText: {
        color: '#ffffff',
    },
    retryButton: {
        marginTop: 15,
        backgroundColor: '#0284C7',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    darkRetryButton: {
        backgroundColor: '#0369A1',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
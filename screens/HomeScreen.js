import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '../components/ThemeContext'
import { LanguageContext } from '../components/LanguageContext'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as Location from 'expo-location'

export default function HomeScreen({ navigation: propNavigation }) {
    const { darkMode } = useContext(ThemeContext)
    const { texts } = useContext(LanguageContext)
    const navigation = useNavigation() || propNavigation
    const [boulderHalls, setBoulderHalls] = useState([])
    const [nearbyHalls, setNearbyHalls] = useState([])
    const [userLocation, setUserLocation] = useState(null)

    useEffect(() => {
        getUserLocation()
    }, [])

    useEffect(() => {
        if (userLocation) {
            fetchBoulderHalls()
        }
    }, [userLocation])

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()

            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                })

                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                })
            } else {
                // Default location (Netherlands center) if permission not granted
                setUserLocation({
                    latitude: 52.1326,
                    longitude: 5.2913,
                })
            }
        } catch (err) {
            console.error("Error getting location:", err)
            // Set default location on error
            setUserLocation({
                latitude: 52.1326,
                longitude: 5.2913,
            })
        }
    }

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371 // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1)
        const dLon = deg2rad(lon2 - lon1)
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c // Distance in km
        return distance
    }

    const deg2rad = (deg) => {
        return deg * (Math.PI/180)
    }

    const fetchBoulderHalls = async () => {
        try {
            const response = await fetch('https://wesleynederpel.github.io/BoulderhallData/boulderhalls.json')

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const data = await response.json()
            setBoulderHalls(data)

            // Calculate distance for each hall
            const hallsWithDistance = data.map(hall => {
                // Calculate real distance from user
                const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    hall.latitude,
                    hall.longitude
                )

                // Add rating (in a real app, this would come from the API)
                return {
                    ...hall,
                    distance: distance.toFixed(1),
                    rating: (Math.random() * 1.5 + 3.5).toFixed(1)
                }
            })

            // Sort by distance and take the 3 closest
            const closest = hallsWithDistance
                .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                .slice(0, 3)

            setNearbyHalls(closest)

        } catch (err) {
            console.error('Error fetching boulder halls:', err)
        }
    }

    // Navigation handlers
    const goToMap = () => navigation.navigate('Map')
    const goToList = () => navigation.navigate('List')

    const goToHallOnMap = (hall) => {
        navigation.navigate('Map', {
            selectedHall: hall
        })
    }

    // Refresh nearby halls when returning to this screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (userLocation) {
                fetchBoulderHalls()
            }
        })

        return unsubscribe
    }, [navigation, userLocation])

    return (
        <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : null]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, darkMode ? styles.darkText : null]}>
                        {texts.appTitle}
                    </Text>
                    <Text style={[styles.subtitle, darkMode ? styles.darkSubText : null]}>
                        {texts.appSubtitle}
                    </Text>
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, darkMode ? styles.darkActionButton : null]}
                        onPress={goToMap}
                    >
                        <Ionicons
                            name="map"
                            size={28}
                            color={darkMode ? "#7ED3FC" : "#0284C7"}
                        />
                        <Text style={[styles.actionText, darkMode ? styles.darkText : null]}>
                            {texts.findOnMap}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, darkMode ? styles.darkActionButton : null]}
                        onPress={goToList}
                    >
                        <Ionicons
                            name="list"
                            size={28}
                            color={darkMode ? "#7ED3FC" : "#0284C7"}
                        />
                        <Text style={[styles.actionText, darkMode ? styles.darkText : null]}>
                            {texts.browseList}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Nearby Boulder Halls */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, darkMode ? styles.darkText : null]}>
                            {texts.nearbyBoulderHalls}
                        </Text>
                        <TouchableOpacity onPress={goToList}>
                            <Text style={styles.seeAll}>{texts.seeAll}</Text>
                        </TouchableOpacity>
                    </View>

                    {nearbyHalls.length === 0 ? (
                        <Text style={[styles.noHallsText, darkMode ? styles.darkSubText : null]}>
                            {texts.noNearbyHalls}
                        </Text>
                    ) : (
                        nearbyHalls.map((hall, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.hallCard, darkMode ? styles.darkHallCard : null]}
                                onPress={() => goToHallOnMap(hall)}
                            >
                                <View style={styles.hallInfo}>
                                    <Text style={[styles.hallName, darkMode ? styles.darkText : null]}>
                                        {hall.name}
                                    </Text>
                                    <View style={styles.locationContainer}>
                                        <Ionicons name="location" size={16} color={darkMode ? "#7ED3FC" : "#0284C7"} />
                                        <Text style={[styles.locationText, darkMode ? styles.darkSubText : null]}>
                                            {hall.distance} {texts.kmAway} • {hall.city}, {hall.province}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.ratingContainer, darkMode ? styles.darkRatingContainer : null]}>
                                    <Text style={[styles.rating, darkMode ? styles.darkRatingText : null]}>
                                        {hall.rating}
                                    </Text>
                                    <Ionicons name="star" size={14} color={darkMode ? "#FBBF24" : "#F59E0B"} />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Today's Tip */}
                <View style={[styles.tipContainer, darkMode ? styles.darkTipContainer : null]}>
                    <View style={styles.tipHeader}>
                        <Ionicons name="bulb" size={22} color={darkMode ? "#FBBF24" : "#F59E0B"} />
                        <Text style={[styles.tipTitle, darkMode ? styles.darkText : null]}>
                            {texts.climbingTip}
                        </Text>
                    </View>
                    <Text style={[styles.tipText, darkMode ? styles.darkSubText : null]}>
                        {texts.tipText}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        marginTop: 12,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    darkText: {
        color: '#F3F4F6',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    darkSubText: {
        color: '#9CA3AF',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    actionButton: {
        backgroundColor: '#E0F2FE',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        width: '48%',
        elevation: 2,
    },
    darkActionButton: {
        backgroundColor: '#1E293B',
    },
    actionText: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    seeAll: {
        color: '#0284C7',
        fontWeight: '600',
    },
    hallCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    darkHallCard: {
        backgroundColor: '#1E293B',
    },
    hallInfo: {
        flex: 1,
    },
    hallName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 250,
    },
    locationText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 6,
        borderRadius: 8,
        gap: 4,
    },
    darkRatingContainer: {
        backgroundColor: '#374151',
    },
    rating: {
        fontWeight: '700',
        color: '#111827',
    },
    darkRatingText: {
        color: '#F3F4F6',
    },
    tipContainer: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    darkTipContainer: {
        backgroundColor: '#422006',
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    tipText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    noHallsText: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 20,
    },
});

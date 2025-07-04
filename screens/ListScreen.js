import React, { useState, useEffect, useContext } from 'react';
import {StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, TextInput
} from 'react-native';
import { ThemeContext } from '../components/ThemeContext';
import { LanguageContext } from '../components/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListScreen({navigation}) {
    const [boulderHalls, setBoulderHalls] = useState([]);
    const [filteredHalls, setFilteredHalls] = useState([]);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { darkMode } = useContext(ThemeContext);
    const { texts } = useContext(LanguageContext);

    useEffect(() => {
        fetchBoulderHalls();
        loadFavorites();
    }, []);

    useEffect(() => {
        filterHalls();
    }, [boulderHalls, favorites, showOnlyFavorites, searchQuery]);

    const loadFavorites = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('favorite-halls');
            const savedFavorites = jsonValue != null ? JSON.parse(jsonValue) : [];
            setFavorites(savedFavorites);
        } catch (error) {
            console.error("Could not load favorites", error);
        }
    };

    const saveFavorites = async (newFavorites) => {
        try {
            const jsonValue = JSON.stringify(newFavorites);
            await AsyncStorage.setItem('favorite-halls', jsonValue);
        } catch (error) {
            console.error("Could not save favorites", error);
        }
    };

    const toggleFavorite = (hallName) => {
        let newFavorites;
        if (favorites.includes(hallName)) {
            newFavorites = favorites.filter(name => name !== hallName);
        } else {
            newFavorites = [...favorites, hallName];
        }
        setFavorites(newFavorites);
        saveFavorites(newFavorites);
    };

    const toggleFavoritesFilter = () => {
        setShowOnlyFavorites(!showOnlyFavorites);
    };

    const filterHalls = () => {
        let result = [...boulderHalls];

        if (showOnlyFavorites) {
            result = result.filter(hall => favorites.includes(hall.name));
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(hall =>
                hall.name.toLowerCase().includes(query) ||
                hall.city.toLowerCase().includes(query) ||
                hall.province.toLowerCase().includes(query)
            );
        }

        setFilteredHalls(result);
    };

    const fetchBoulderHalls = async () => {
        try {
            const response = await fetch('https://wesleynederpel.github.io/BoulderhallData/boulderhalls.json');

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Add a random rating to each hall for display purposes
            const hallsWithRatings = data.map(hall => ({
                ...hall,
                rating: (Math.random() * 1.5 + 3.5).toFixed(1)
            }));

            setBoulderHalls(hallsWithRatings);
            setFilteredHalls(hallsWithRatings);
            setError(null);
        } catch (err) {
            console.error('Error fetching boulder halls:', err);
        }
    };

    const renderBoulderHall = ({ item }) => {
        const isFavorite = favorites.includes(item.name);

        return (
            <TouchableOpacity
                style={[styles.hallCard, darkMode ? styles.darkHallCard : null]}
                onPress={() => navigation.navigate('Map', {
                    selectedHall: item
                })}
            >
                <View style={styles.hallInfo}>
                    <Text style={[styles.hallName, darkMode ? styles.darkText : null]}>
                        {item.name}
                    </Text>
                    <View style={styles.locationContainer}>
                        <Ionicons name="location" size={16} color={darkMode ? "#7ED3FC" : "#0284C7"} />
                        <Text style={[styles.locationText, darkMode ? styles.darkSubText : null]}>
                            {item.city}, {item.province}
                        </Text>
                    </View>
                </View>
                <View style={styles.rightContent}>
                    <View style={[styles.ratingContainer, darkMode ? styles.darkRatingContainer : null]}>
                        <Text style={[styles.rating, darkMode ? styles.darkRatingText : null]}>
                            {item.rating}
                        </Text>
                        <Ionicons name="star" size={14} color={darkMode ? "#FBBF24" : "#F59E0B"} />
                    </View>
                    <TouchableOpacity
                        onPress={() => toggleFavorite(item.name)}
                        style={styles.favoriteButton}
                    >
                        <Ionicons
                            name={isFavorite ? "star" : "star-outline"}
                            size={22}
                            color="#FFD700"
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : null]}>
            <View style={styles.header}>
                <Text style={[styles.title, darkMode ? styles.darkText : null]}>
                    {texts.boulderHalls}
                </Text>
                <Text style={[styles.subtitle, darkMode ? styles.darkSubText : null]}>
                    {texts.browseLocations}
                </Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, darkMode ? styles.darkSearchContainer : null]}>
                <Ionicons name="search" size={20} color={darkMode ? "#7ED3FC" : "#0284C7"} />
                <TextInput
                    style={[styles.searchInput, darkMode ? styles.darkSearchInput : null]}
                    placeholder={texts.searchPlaceholder}
                    placeholderTextColor={darkMode ? "#9CA3AF" : "#6B7280"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Favorites Filter */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        showOnlyFavorites ? styles.activeFilterButton : null,
                        darkMode && !showOnlyFavorites ? styles.darkFilterButton : null
                    ]}
                    onPress={toggleFavoritesFilter}
                >
                    <Ionicons
                        name="star"
                        size={18}
                        color={showOnlyFavorites ? "#FFFFFF" : "#FFD700"}
                    />
                    <Text
                        style={[
                            styles.filterText,
                            showOnlyFavorites ? styles.activeFilterText : null,
                            darkMode && !showOnlyFavorites ? styles.darkText : null
                        ]}
                    >
                        {texts.favorites}
                    </Text>
                </TouchableOpacity>

                <Text style={[styles.resultCount, darkMode ? styles.darkSubText : null]}>
                    {filteredHalls.length} {texts.hallsFound}
                </Text>
            </View>

            {showOnlyFavorites && filteredHalls.length === 0 ? (
                <View style={styles.noResultsContainer}>
                    <Ionicons
                        name="star-outline"
                        size={60}
                        color={darkMode ? "#4B5563" : "#D1D5DB"}
                    />
                    <Text style={[styles.noResultsText, darkMode ? styles.darkText : null]}>
                        {texts.noFavorites}
                    </Text>
                    <Text style={[styles.noResultsSubText, darkMode ? styles.darkSubText : null]}>
                        {texts.addToFavorites}
                    </Text>
                </View>
            ) : searchQuery && filteredHalls.length === 0 ? (
                <View style={styles.noResultsContainer}>
                    <Ionicons
                        name="search-outline"
                        size={60}
                        color={darkMode ? "#4B5563" : "#D1D5DB"}
                    />
                    <Text style={[styles.noResultsText, darkMode ? styles.darkText : null]}>
                        {texts.noMatchingHalls}
                    </Text>
                    <Text style={[styles.noResultsSubText, darkMode ? styles.darkSubText : null]}>
                        {texts.adjustSearch}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHalls}
                    renderItem={renderBoulderHall}
                    keyExtractor={item => item.name}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 12,
        marginBottom: 16,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        elevation: 2,
    },
    darkSearchContainer: {
        backgroundColor: '#1E293B',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#111827',
    },
    darkSearchInput: {
        color: '#F3F4F6',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    darkFilterButton: {
        borderColor: '#FFD700',
    },
    activeFilterButton: {
        backgroundColor: '#FFD700',
    },
    filterText: {
        marginLeft: 5,
        fontWeight: '500',
        color: '#333',
    },
    activeFilterText: {
        color: '#000',
    },
    resultCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
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
    },
    locationText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
    },
    rightContent: {
        alignItems: 'flex-end',
        gap: 8,
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
    favoriteButton: {
        padding: 4,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
        textAlign: 'center',
        marginHorizontal: 20,
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
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
        color: '#111827',
    },
    noResultsSubText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    }
});
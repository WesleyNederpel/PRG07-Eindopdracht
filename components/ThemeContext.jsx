// ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Load the saved theme preference when app starts
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('darkmode-preference');
            const savedDarkMode = jsonValue != null ? JSON.parse(jsonValue) : null;
            if (savedDarkMode !== null) {
                setDarkMode(savedDarkMode);
            }
        } catch (error) {
            console.error("Could not load theme preference", error);
        }
    };

    const toggleDarkMode = async () => {
        try {
            const newDarkMode = !darkMode;
            setDarkMode(newDarkMode);
            const jsonValue = JSON.stringify(newDarkMode);
            await AsyncStorage.setItem('darkmode-preference', jsonValue);
        } catch (error) {
            console.error("Could not save theme preference", error);
        }
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
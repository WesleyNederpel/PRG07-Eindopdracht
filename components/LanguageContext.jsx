import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../translations/Languages';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [texts, setTexts] = useState(translations.en);

  useEffect(() => {
    // Load saved language preference
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app-language');
        if (savedLanguage !== null) {
          setCurrentLanguage(savedLanguage);
          setTexts(translations[savedLanguage]);
        }
      } catch (error) {
        console.error('Failed to load language preference', error);
      }
    };

    loadLanguagePreference();
  }, []);

  const changeLanguage = async (languageCode) => {
    try {
      // Validate language code
      if (!translations[languageCode]) {
        console.error('Invalid language code:', languageCode);
        return;
      }
      
      // Update state
      setCurrentLanguage(languageCode);
      setTexts(translations[languageCode]);
      
      // Save preference
      await AsyncStorage.setItem('app-language', languageCode);
    } catch (error) {
      console.error('Failed to save language preference', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ texts, currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
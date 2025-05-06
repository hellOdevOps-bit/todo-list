// ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext(); // ✅ le plus important

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('darkMode');
      if (saved !== null) setIsDarkMode(saved === 'true');
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await AsyncStorage.setItem('darkMode', newValue.toString());
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      background: isDarkMode ? '#000' : '#fff',
      text: isDarkMode ? '#fff' : '#000',
      input: isDarkMode ? '#111' : '#eee',
      placeholder: isDarkMode ? '#888' : '#666',
      card: isDarkMode ? '#111' : '#f5f5f5',
      doneText: isDarkMode ? '#777' : '#aaa',
      border: isDarkMode ? '#fff' : '#000',
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
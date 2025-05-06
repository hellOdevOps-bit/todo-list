//SettingsScreen.js
import React, { useContext } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../ThemeContext';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, colors } = useContext(ThemeContext);  

  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: colors.text,
      fontSize: 18,
      marginBottom: 10,
    },
    resetButton: {
        marginTop: 30,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f55',
      },
      resetText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
      },      
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🌗 Mode</Text>
      <Switch
        value={isDarkMode}
        onValueChange={toggleTheme}
        trackColor={{ false: '#ccc', true: '#666' }}
        thumbColor={isDarkMode ? '#fff' : '#000'}
      />
    </View>
  );
}
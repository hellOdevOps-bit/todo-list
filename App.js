// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import { ThemeProvider } from './ThemeContext'; // attention ici ⚠️

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
      <Stack.Navigator
  screenOptions={{
    headerShown: false, // 👈 hop, ça dégage
  }}
>
  <Stack.Screen name="Accueil" component={HomeScreen} />
  <Stack.Screen name="Paramètres" component={SettingsScreen} />
</Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
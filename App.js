// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import CalendarScreen from './screens/CalendarScreen';
import { ThemeProvider } from './ThemeContext';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Accueil" component={HomeScreen} />
      <Stack.Screen name="Paramètres" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              backgroundColor: '#111',
            },
            drawerActiveTintColor: '#fff',
            drawerInactiveTintColor: '#888',
          }}
        >
          <Drawer.Screen name="Accueil" component={MainStack} />
          <Drawer.Screen name="Calendrier" component={CalendarScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
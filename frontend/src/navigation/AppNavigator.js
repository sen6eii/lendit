import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from '../../screens/SplashScreen';
import Onboarding from '../../screens/Onboarding';
import LoginScreen from '../../screens/LoginScreen';
import RegisterScreen from '../../screens/RegisterScreen';
import FirstTimeScreen from '../../screens/FirstTimeScreen';
import JoinCommunityScreen from '../../screens/JoinCommunityScreen';
import JoinCommunityConfirmationScreen from '../../screens/JoinCommunityConfirmationScreen';
import CreateGroupNavigator from './CreateGroupNavigator'; 
import MainTabs from './MainTabs'; // TabNavigator con Home, GroupsScreen, NotificationsScreen

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isFirstTime, setIsFirstTime] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); 

  useEffect(() => {
    const checkAppState = async () => {
      try {
        const firstTime = await AsyncStorage.getItem('isFirstTime');
        const token = await AsyncStorage.getItem('userToken');

        setIsAuthenticated(!!token);
        // Si 'true', es la primera vez (acaba de registrarse)
        // Si 'false' o null, no es la primera vez.
        setIsFirstTime(firstTime === 'true');
      } catch (error) {
        console.error('Error verificando el estado inicial:', error);
      }
    };
    checkAppState();
  }, []);

  if (isFirstTime === null) {
    // Mientras no sabemos el estado, retornamos null o una pantalla de carga
    return null;
  }

  let initialRoute = 'Splash';
  if (isAuthenticated) {
    if (isFirstTime) {
      initialRoute = 'FirstTime';
    } else {
      // Si ya está autenticado y no es primera vez, que vaya a las tabs
      initialRoute = 'MainTabs';
    }
  } else {
    // Si no está autenticado: inicia por Splash
    initialRoute = 'Splash';
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      {/* Rutas para usuarios no autenticados */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Rutas para primera vez */}
      <Stack.Screen name="FirstTime" component={FirstTimeScreen} />

      {/* Rutas principales una vez autenticado */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Otras pantallas */}
      <Stack.Screen name="JoinCommunity" component={JoinCommunityScreen} />
      <Stack.Screen name="JoinCommunityConfirmation" component={JoinCommunityConfirmationScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

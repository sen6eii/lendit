import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { GroupProvider } from './src/context/GroupContext.js';

export default function App() {
  return (
    <GroupProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GroupProvider>
  );
}

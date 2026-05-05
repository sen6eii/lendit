import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../../screens/Home';
import NotificationsScreen from '../../screens/NotificationsScreen';
import GroupsStack from './GroupsStack';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab" // Define la pestaña inicial
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'GroupsTab') {
            iconName = 'people';
          } else if (route.name === 'NotificationsTab') {
            iconName = 'notifications';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} options={{ title: 'Inicio' }} />
      <Tab.Screen
        name="GroupsTab"
        component={GroupsStack}
        options={{ title: 'Grupos' }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{ title: 'Notificaciones' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;

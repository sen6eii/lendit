import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupsScreen from '../../screens/GroupsScreen';
import GroupDetailsScreen from '../../screens/GroupDetailsScreen';
import ResourceDetailsScreen from '../../screens/ResourceDetailsScreen';
import EditResourceScreen from '../../screens/EditResourceScreen';
import CreateResourceNavigator from '../../screens/CreateResource/CreateResourceNavigator'; // Asegúrate de este path

const Stack = createNativeStackNavigator();

const GroupsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Groups"
        component={GroupsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{
          title: 'Detalles del Grupo',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ResourceDetails"
        component={ResourceDetailsScreen}
        options={{
          title: 'Detalles del Recurso',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="EditResource"
        component={EditResourceScreen}
        options={{
          title: 'Editar Recurso',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="CreateResource"
        component={CreateResourceNavigator} // Usa el navigator específico
        options={{
          title: 'Crear Recurso',
          headerShown: false, 
        }}
      />
    </Stack.Navigator>
  );
};

export default GroupsStack;

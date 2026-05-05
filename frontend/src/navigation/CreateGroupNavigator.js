import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CreateGroupStep1 from '../../screens/CreateGroupStep1';
import CreateGroupStep2 from '../../screens/CreateGroupStep2';
import CreateGroupStep3 from '../../screens/CreateGroupStep3';
import CreateGroupStep4 from '../../screens/CreateGroupStep4';
import CreateGroupStep5 from '../../screens/CreateGroupStep5';

const Stack = createStackNavigator();

const CreateGroupNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Step1" component={CreateGroupStep1} />
      <Stack.Screen name="Step2" component={CreateGroupStep2} />
      <Stack.Screen name="Step3" component={CreateGroupStep3} />
      <Stack.Screen name="Step4" component={CreateGroupStep4} />
      <Stack.Screen name="Step5" component={CreateGroupStep5} />
    </Stack.Navigator>
  );
};

export default CreateGroupNavigator;

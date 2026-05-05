import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';

const Stack = createNativeStackNavigator();

const CreateResourceNavigator = ({ route, navigation }) => {
  const { groupId } = route.params;

  console.log('Group ID recibido en CreateResourceNavigator:', groupId); 

  // almacena los datos del recurso
  const [resourceData, setResourceData] = useState({
    nombre_recurso: '',
    descripcion: '',
    categoria: '',
    fotos: [],
    tutorial: '',
    condiciones_uso: '',
    autenticacion_extra: false,
    max_dias_reserva: 1,
    disponibilidad: {
      horas_especificas: { desde: '', hasta: '' },
      dias_especificos: [],
    },
    devolucion_mismo_punto: true,
  });

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerLeft: ({ canGoBack }) =>
          canGoBack ? (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ color: '#007bff', marginLeft: 10 }}>← Atrás</Text>
            </TouchableOpacity>
          ) : null,
      }}
    >
      <Stack.Screen name="Step1" options={{ title: 'Agregar recurso 1/4' }}>
        {props => (
          <Step1
            {...props}
            resourceData={resourceData}
            setResourceData={setResourceData}
            groupId={groupId}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Step2" options={{ title: 'Agregar recurso 2/4' }}>
        {props => (
          <Step2
            {...props}
            resourceData={resourceData}
            setResourceData={setResourceData}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Step3" options={{ title: 'Agregar recurso 3/4' }}>
        {props => (
          <Step3
            {...props}
            resourceData={resourceData}
            setResourceData={setResourceData}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Step4" options={{ title: 'Agregar recurso 4/4' }}>
  {props => (
    <Step4
      {...props}
      resourceData={resourceData}
      groupId={groupId} 
    />
  )}
</Stack.Screen>
    </Stack.Navigator>
  );
};

export default CreateResourceNavigator;

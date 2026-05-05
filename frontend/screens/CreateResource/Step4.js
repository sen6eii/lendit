import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../utils/apiConfig';

const Step4 = ({ navigation, resourceData, groupId }) => {
  const handleFinish = async () => {
    console.log('Datos a enviar al backend:', resourceData); 
    console.log('Group ID:', groupId); 
  
    if (!groupId) {
      console.error('Group ID no está definido');
      Alert.alert('Error', 'No se puede crear el recurso porque falta el ID del grupo.');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token obtenido:', token); // Validar el token
  
   
      const categoriasValidas = ['jardinería', 'bricolaje', 'cocina', 'otros'];
      const categoriaNormalizada = categoriasValidas.includes(resourceData.categoria?.toLowerCase())
        ? [resourceData.categoria.toLowerCase()]
        : ['otros'];
  
    
      const requestBody = {
        nombre_recurso: resourceData.nombre_recurso || 'Recurso sin nombre',
        descripcion: { ops: [{ insert: resourceData.descripcion || '' }] },
        categoria: categoriaNormalizada,
        grupo: groupId,
        fotos: resourceData.fotos && resourceData.fotos.length > 0 
          ? resourceData.fotos 
          : ["https://cifer.com.uy/wp-content/uploads/2018/09/5105.png"], 
        condiciones_uso: { ops: [{ insert: resourceData.condiciones_uso || '' }] },
      };
  
      console.log('Payload final:', JSON.stringify(requestBody, null, 2)); 
  
      const response = await fetch(`${BASE_URL}/api/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Recurso creado con éxito:', result);
        Alert.alert('Éxito', 'Recurso creado correctamente.');
        navigation.navigate('Groups'); // Redirigir a la pantalla de grupos
      } else {
        const errorText = await response.text();
        console.error('Error al crear recurso (texto de error):', errorText);
        Alert.alert('Error', 'No se pudo crear el recurso: ' + errorText);
      }
    } catch (err) {
      console.error('Error al enviar datos:', err);
      Alert.alert('Error', 'Ocurrió un error al intentar crear el recurso.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen</Text>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Nombre del Recurso</Text>
        <Text style={styles.sectionContent}>{resourceData.nombre_recurso}</Text>

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.sectionContent}>{resourceData.descripcion}</Text>

        <Text style={styles.sectionTitle}>Categoría</Text>
        <Text style={styles.sectionContent}>{resourceData.categoria}</Text>

        <Text style={styles.sectionTitle}>Condiciones de Uso</Text>
        <Text style={styles.sectionContent}>{resourceData.condiciones_uso}</Text>

        <Text style={styles.sectionTitle}>Tutorial</Text>
        <Text style={styles.sectionContent}>
          {resourceData.tutorial || 'No incluido'}
        </Text>

        <Text style={styles.sectionTitle}>Días Máximos de Reserva</Text>
        <Text style={styles.sectionContent}>{resourceData.max_dias_reserva}</Text>

        {resourceData.disponibilidad.horas_especificas.desde && (
          <>
            <Text style={styles.sectionTitle}>Disponibilidad por Horas</Text>
            <Text style={styles.sectionContent}>
              Desde: {resourceData.disponibilidad.horas_especificas.desde} - Hasta: {resourceData.disponibilidad.horas_especificas.hasta}
            </Text>
          </>
        )}

        <Text style={styles.sectionTitle}>Devolución en el Mismo Punto</Text>
        <Text style={styles.sectionContent}>
          {resourceData.devolucion_mismo_punto ? 'Sí' : 'No'}
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleFinish}>
        <Text style={styles.buttonText}>Finalizar creación recurso</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  scrollView: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  sectionContent: { fontSize: 16, color: '#555', marginTop: 5 },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default Step4;

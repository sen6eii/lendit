import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/apiConfig';

const EditResourceScreen = ({ route, navigation }) => {
  const { resourceId } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchResourceDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${BASE_URL}/api/resources/${resourceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          setName(data.nombre_recurso);
          setDescription(data.descripcion.ops[0]?.insert || '');
          setCategory(data.categoria[0] || '');
        } else {
          Alert.alert('Error', 'No se pudo cargar la información del recurso.');
        }
      } catch (error) {
        console.error('Error al cargar detalles del recurso:', error);
        Alert.alert('Error', 'Ocurrió un error al cargar los detalles del recurso.');
      }
    };

    fetchResourceDetails();
  }, [resourceId]);

  const handleUpdateResource = async () => {
    if (!name || !description || !category) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${BASE_URL}/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_recurso: name,
          descripcion: { ops: [{ insert: description }] },
          categoria: [category],
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', 'Recurso actualizado correctamente.');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.error || 'No se pudo actualizar el recurso.');
      }
    } catch (error) {
      console.error('Error al actualizar recurso:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar el recurso.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Recurso</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del recurso"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdateResource}>
        <Text style={styles.buttonText}>Actualizar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default EditResourceScreen;

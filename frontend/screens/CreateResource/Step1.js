import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Step1 = ({ navigation, resourceData, setResourceData }) => {
  const [nombreRecurso, setNombreRecurso] = useState(resourceData.nombre_recurso || '');
  const [descripcion, setDescripcion] = useState(resourceData.descripcion || '');
  const [categoria, setCategoria] = useState(resourceData.categoria || 'jardinería');
  const [unidades, setUnidades] = useState(resourceData.unidades || 1);

  const handleNext = () => {
    if (!nombreRecurso || !descripcion || !categoria) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    setResourceData({
      ...resourceData,
      nombre_recurso: nombreRecurso,
      descripcion,
      categoria,
      unidades,
    });

    navigation.navigate('Step2');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Nombre del recurso</Text>
        <TextInput
          style={styles.input}
          value={nombreRecurso}
          onChangeText={setNombreRecurso}
          placeholder="Ejemplo: Taladro eléctrico"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Ejemplo: Taladro en buen estado..."
          multiline
        />

        <Text style={styles.label}>Unidades</Text>
        <View style={styles.unidadesContainer}>
          <TouchableOpacity
            onPress={() => setUnidades(Math.max(1, unidades - 1))}
            style={styles.unidadesButton}
          >
            <Text style={styles.unidadesButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.unidadesCount}>{unidades}</Text>
          <TouchableOpacity
            onPress={() => setUnidades(unidades + 1)}
            style={styles.unidadesButton}
          >
            <Text style={styles.unidadesButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Categoría</Text>
        <Picker
          selectedValue={categoria}
          onValueChange={(itemValue) => setCategoria(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Jardinería" value="jardinería" />
          <Picker.Item label="Bricolaje" value="bricolaje" />
          <Picker.Item label="Cocina" value="cocina" />
          <Picker.Item label="Otros" value="otros" />
        </Picker>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Añadir fotos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: {
    padding: 20,
  },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  unidadesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  unidadesButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    marginHorizontal: 10,
  },
  unidadesButtonText: { fontSize: 16, fontWeight: 'bold' },
  unidadesCount: { fontSize: 16 },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: { color: '#007bff', fontWeight: 'bold' },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default Step1;

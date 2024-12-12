import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useGroup } from '../src/context/GroupContext'; 

const CreateGroupStep2 = () => {
  const navigation = useNavigation();
  const { groupData, setGroupData } = useGroup(); // Obtenemos los datos del contexto
  const [groupName, setGroupName] = useState(groupData.nombre || ''); // Usamos el contexto si hay datos
  const [communityType, setCommunityType] = useState(groupData.tipoComunidad || 'edificio'); // Tipo por defecto

  const handleContinue = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Por favor, introduce un nombre para el grupo.');
      return;
    }
    // Actualizamos el contexto con el nombre y tipo de comunidad
    setGroupData({ ...groupData, nombre: groupName, tipoComunidad: communityType });
    navigation.push('Step3'); // Navegamos al siguiente paso
  };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Indicador de paso */}
      <Text style={styles.stepIndicator}>1/4</Text>

      {/* Contenedor de imagen  */}
      <TouchableOpacity style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="add" size={24} color="white" style={styles.addIcon} />
        </View>
      </TouchableOpacity>

      {/* Campo de entrada para el nombre del grupo */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Vecinos unidos"
        value={groupName}
        onChangeText={setGroupName}
      />

      {/* Selección del tipo de comunidad */}
      <Text style={styles.label}>Selecciona el tipo de comunidad</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={communityType}
          onValueChange={(itemValue) => setCommunityType(itemValue)}
        >
          <Picker.Item label="Barrio Cerrado" value="barrio cerrado" />
          <Picker.Item label="Edificio" value="edificio" />
          <Picker.Item label="Coworking" value="coworking" />
          <Picker.Item label="Universidad" value="universidad" />
          <Picker.Item label="Otro" value="otro" />
        </Picker>
      </View>

      {/* Botón para continuar */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F0',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  stepIndicator: {
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    backgroundColor: '#000',
    borderRadius: 50,
    padding: 5,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#FFF',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 5,
    marginBottom: 20,
    backgroundColor: '#FFF',
  },
  continueButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateGroupStep2;

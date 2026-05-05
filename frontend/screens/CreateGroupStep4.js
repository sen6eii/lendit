import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useGroup } from '../src/context/GroupContext'; 

const CreateGroupStep4 = () => {
  const navigation = useNavigation();
  const { groupData, setGroupData } = useGroup(); 
  const [selectedOption, setSelectedOption] = useState(groupData.privacidad || ''); 

  const handleContinue = () => {
    if (!selectedOption) {
      Alert.alert('Error', 'Por favor selecciona una opción de privacidad');
      return;
    }
    // Guardamos la opción seleccionada en el contexto
    setGroupData({ ...groupData, privacidad: selectedOption });
    navigation.navigate('Step5'); // Navegamos al siguiente paso
  };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Indicador de paso */}
      <Text style={styles.stepIndicator}>3/4</Text>

      {/* Título y descripción */}
      <Text style={styles.title}>Configuración de privacidad</Text>
      <Text style={styles.description}>
        Determina si los miembros deben ser aprobados por un administrador o si pueden unirse automáticamente.
      </Text>

      {/* Opción: Grupo cerrado */}
      <TouchableOpacity
        style={[
          styles.option,
          selectedOption === 'grupo_cerrado' && styles.optionSelected,
        ]}
        onPress={() => setSelectedOption('grupo_cerrado')}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Grupo cerrado</Text>
          <Text style={styles.optionDescription}>
            Solo pueden unirse usuarios aprobados.
          </Text>
        </View>
        <Ionicons name="lock-closed-outline" size={24} color="black" />
      </TouchableOpacity>

      {/* Opción: Grupo público */}
      <TouchableOpacity
        style={[
          styles.option,
          selectedOption === 'grupo_publico' && styles.optionSelected,
        ]}
        onPress={() => setSelectedOption('grupo_publico')}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Grupo público</Text>
          <Text style={styles.optionDescription}>
            Usuarios pueden unirse sin aprobación.
          </Text>
        </View>
        <Ionicons name="checkmark-circle-outline" size={24} color="black" />
      </TouchableOpacity>

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
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  stepIndicator: {
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  optionSelected: {
    borderColor: '#1E293B',
    backgroundColor: '#F1F5F9',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  continueButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateGroupStep4;

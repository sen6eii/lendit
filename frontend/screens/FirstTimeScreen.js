import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FirstTimeScreen = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleContinue = () => {
    if (!selectedOption) {
      alert('Por favor selecciona una opción');
      return;
    }
    if (selectedOption === 'create') {
      navigation.navigate('CreateGroup');
    } else if (selectedOption === 'join') {
      navigation.navigate('JoinCommunity');
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón de regresar */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={async () => {
          try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('isFirstTime');
            console.log('Sesión cerrada correctamente');
            navigation.replace('Login');
          } catch (error) {
            console.error('Error cerrando la sesión:', error);
            alert('Hubo un error cerrando la sesión. Intenta de nuevo.');
          }
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Comencemos</Text>
      <Text style={styles.subtitle}>
        Estamos emocionados de tenerte en <Text style={styles.bold}>LendIt.</Text>
        Elige una opción para continuar.
      </Text>

      <TouchableOpacity
        style={[styles.option, selectedOption === 'create' && styles.selectedOption]}
        onPress={() => setSelectedOption('create')}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Crear un grupo</Text>
          <Text style={styles.optionDescription}>Administra un grupo cerrado</Text>
        </View>
        <Ionicons name="people-outline" size={24} color={selectedOption === 'create' ? '#000' : '#6B7280'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, selectedOption === 'join' && styles.selectedOption]}
        onPress={() => setSelectedOption('join')}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Unirse a una comunidad</Text>
          <Text style={styles.optionDescription}>Mediante código o link de acceso</Text>
        </View>
        <Ionicons name="people-circle-outline" size={24} color={selectedOption === 'join' ? '#000' : '#6B7280'} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F4F4',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 80,
    marginBottom: 10,
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  selectedOption: {
    borderColor: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  continueButton: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FirstTimeScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const JoinCommunityScreen = () => {
  const navigation = useNavigation();
  const [accessCode, setAccessCode] = useState('');

  const handleContinue = () => {
    if (!accessCode.trim()) {
      Alert.alert('Error', 'Por favor, introduce un código de acceso.');
      return;
    }

    // Navegar a la pantalla de confirmación con el código de acceso
    navigation.navigate('JoinCommunityConfirmation', { accessCode });
  };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso con Ionicons */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Únete ya</Text>
      <Text style={styles.description}>
        Si tienes un link, ábrelo. Sino, escribe la clave de acceso asociada.
      </Text>

      {/* Campo de texto para el código de acceso */}
      <TextInput
        style={styles.input}
        placeholder="GRU-007"
        value={accessCode}
        onChangeText={setAccessCode}
      />

      {/* Botón de ayuda */}
      <TouchableOpacity style={styles.helpButton}>
        <Text style={styles.helpText}>?</Text>
      </TouchableOpacity>

      {/* Texto de exploración */}
      <TouchableOpacity>
        <Text style={styles.linkText}>Explorar comunidades cerca de mí</Text>
      </TouchableOpacity>

      {/* Botón para continuar */}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF6EE',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 80, // Ajustar el título para que no se superponga con el botón de atrás
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  helpButton: {
    position: 'absolute',
    top: 140,
    right: 30,
    backgroundColor: '#ddd',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 16,
    color: '#000',
  },
  linkText: {
    color: '#1E293B',
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default JoinCommunityScreen;

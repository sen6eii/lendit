import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/apiConfig';

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!nombre || !email || !password || !confirmPassword || !telefono) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
  
    try {
      const response = await fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email,
          contraseña: password, 
          telefono,
        }),
      });
  
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
console.log('Status de la respuesta:', response.ok);
  
      if (response.ok) {
        // Registro exitoso
        const loginResponse = await fetch(`${BASE_URL}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, contraseña: password }),
        });
  
        const loginData = await loginResponse.json();
  
        if (loginResponse.ok && loginData.token && loginData.id) {
          // Guardar datos en AsyncStorage
          await AsyncStorage.setItem('userToken', loginData.token);
          await AsyncStorage.setItem('userId', loginData.id);
          await AsyncStorage.setItem('isFirstTime', 'true');
  
          Alert.alert('Éxito', 'Usuario registrado y sesión iniciada correctamente');
          navigation.replace('FirstTime');
        } else {
          Alert.alert(
            'Registro exitoso',
            'No se pudo iniciar sesión automáticamente. Inicia sesión manualmente.'
          );
          navigation.replace('Login');
        }
      } else {
        Alert.alert('Error', data.mensaje || 'Error al registrar');
      }
    } catch (error) {
      console.error('Error durante el registro:', error);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Regístrate</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
        placeholderTextColor="#6B7280"
      />

      <TextInput
        style={styles.input}
        placeholder="ejemplo@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#6B7280"
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
        placeholderTextColor="#6B7280"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Crea una contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#6B7280"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Confirma contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#6B7280"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        ¿Ya tienes una cuenta?{' '}
        <Text onPress={() => navigation.navigate('Login')} style={styles.link}>
          Inicia sesión
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1E293B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#1E293B',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  inputPassword: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1E293B',
  },
  eyeIcon: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6b7280',
    fontSize: 14,
  },
  link: {
    color: '#1E293B',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;

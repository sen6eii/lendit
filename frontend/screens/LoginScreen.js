import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/apiConfig';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contraseña: password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Guardar el token en AsyncStorage
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userId', data.id); // Guarda el ID del usuario
   
        console.log('Inicio de sesión exitoso. Navegando a Home...');
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      } else {
        alert(data.mensaje || 'Error en el inicio de sesión');
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
      console.error('Error de inicio de sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="helloworld@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#6B7280"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
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

      <Text style={styles.forgotPassword}>Olvidé mi contraseña</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>O continúa con</Text>
      <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleText}>G</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        ¿No tienes una cuenta aún?{' '}
        <Text onPress={() => navigation.navigate('Register')} style={styles.link}>
          Regístrate
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
    textAlign: 'left',
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
  forgotPassword: {
    textAlign: 'right',
    color: '#1E293B',
    marginBottom: 20,
    fontSize: 14,
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
  orText: {
    textAlign: 'center',
    color: '#6b7280',
    marginVertical: 10,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  googleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EA4335',
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

export default LoginScreen;

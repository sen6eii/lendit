import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useGroup } from '../src/context/GroupContext'; 
import { BASE_URL } from '../utils/apiConfig';

const CreateGroupStep5 = () => {
  const navigation = useNavigation();
  const { groupData } = useGroup(); 

  const handleCreateGroup = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken'); 

      const response = await fetch(`${BASE_URL}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({
          grupo_codigo: `GRA${Math.floor(1000 + Math.random() * 9000)}`, 
          nombre_grupo: groupData.nombre,
          tipo_comunidad: [groupData.tipoComunidad],
          ubicacion: groupData.ubicacion,
          grupo_privado: groupData.privacidad === 'grupo_cerrado',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Grupo creado con éxito');
        navigation.replace('MainTabs', { screen: 'HomeTab' })
      } else {
        Alert.alert('Error', result.message || 'Error al crear el grupo');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Confirmación</Text>
      <Text style={styles.subtitle}>¡Tu primera comunidad está casi lista!</Text>

      {/* Detalles del grupo */}
      <View style={styles.groupDetails}>
        <Image
          source={{
            uri: 'https://img.freepik.com/vector-premium/hermoso-diseno-hogar-vector-vector-logo-icono-vector-clip-dibujos-animados_1277419-108.jpg',
          }}
          style={styles.groupImage}
        />
        <View>
          <Text style={styles.groupName}>{groupData.nombre}</Text>
          <Text style={styles.groupLocation}>
            {groupData.ubicacion
              ? `${groupData.ubicacion.latitud.toFixed(2)}, ${groupData.ubicacion.longitud.toFixed(2)}`
              : 'Ubicación no especificada'}
          </Text>
          <Text style={styles.groupType}>
            {groupData.privacidad === 'grupo_cerrado' ? 'Grupo cerrado' : 'Grupo público'}
          </Text>
        </View>
      </View>

      {/* Botón para crear el grupo */}
      <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
        <Text style={styles.buttonText}>Crear grupo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF6EE',
    justifyContent: 'center',
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
    textAlign: 'left',
    marginTop: 80, // Ajustar para que no se superponga con el botón de atrás
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
    textAlign: 'left',
  },
  groupDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  groupType: {
    fontSize: 14,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreateGroupStep5;

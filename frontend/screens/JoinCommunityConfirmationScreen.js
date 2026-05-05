import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../utils/apiConfig';

const JoinCommunityConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accessCode } = route.params; // Obtenemos el código de acceso
  const [groupDetails, setGroupDetails] = useState(null); // Detalles del grupo
  const [loading, setLoading] = useState(true);

  // Validar el código del grupo al cargar la pantalla
  useEffect(() => {
    const validateGroupCode = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');

        // Obtener todos los grupos
        const response = await fetch(`${BASE_URL}/api/groups`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const groups = await response.json();

        if (response.ok) {
          // Buscar el grupo cuyo grupo_codigo coincida con el accessCode
          const matchingGroup = groups.find((group) => group.grupo_codigo === accessCode);

          if (matchingGroup) {
            setGroupDetails(matchingGroup); // Guardamos los detalles del grupo encontrado
          } else {
            Alert.alert('Error', 'El código de grupo no es válido.');
            navigation.goBack(); // Volvemos a la pantalla anterior
          }
        } else {
          Alert.alert('Error', 'No se pudo obtener la lista de grupos.');
          navigation.goBack(); // Volvemos a la pantalla anterior
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo validar el código del grupo.');
        navigation.goBack(); // Volvemos a la pantalla anterior en caso de error
      } finally {
        setLoading(false);
      }
    };

    validateGroupCode();
  }, [accessCode, navigation]);

  const handleJoin = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const miembroId = await AsyncStorage.getItem('userId'); // Asegúrate de guardar esto en Login/Registro

      const response = await fetch(`${BASE_URL}/api/groups/${groupDetails._id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ miembro_id: miembroId }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Te has unido a la comunidad.');
        navigation.replace('MainTabs', { screen: 'HomeTab' })
      } else {
        Alert.alert('Error', result.error || 'No se pudo unir a la comunidad.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E293B" />
        <Text style={styles.loadingText}>Validando código de grupo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botón de retroceso con Ionicons */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Te estás uniendo a</Text>
      <Text style={styles.groupName}>{groupDetails.nombre_grupo}</Text>

      <View style={styles.groupDetails}>
        <Text style={styles.groupInfo}>Creador: {groupDetails.id_miembro_owner}</Text>
        <Text style={styles.groupInfo}>
          Ubicación: {groupDetails.ubicacion?.latitud}, {groupDetails.ubicacion?.longitud}
        </Text>
        <Text style={styles.groupInfo}>
          Privacidad: {groupDetails.grupo_privado ? 'Cerrado' : 'Público'}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleJoin}>
        <Text style={styles.buttonText}>Ingresar</Text>
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
    marginTop: 80,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  groupDetails: {
    marginBottom: 30,
  },
  groupInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF6EE',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default JoinCommunityConfirmationScreen;

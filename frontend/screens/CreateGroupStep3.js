import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useGroup } from '../src/context/GroupContext'; 

const CreateGroupStep3 = () => {
  const navigation = useNavigation();
  const { groupData, setGroupData } = useGroup(); 
  const [selectedLocation, setSelectedLocation] = useState(
    groupData.ubicacion || { latitud: 37.7749, longitud: -122.4194 }
  ); // Ubicación inicial por defecto

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitud: latitude, longitud: longitude });
  };

  const handleContinue = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Por favor, selecciona una ubicación.');
      return;
    }
    // Guardar la ubicación en el contexto
    setGroupData({ ...groupData, ubicacion: selectedLocation });
    navigation.navigate('Step4'); // Navegar al siguiente paso
  };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Indicador de paso */}
      <Text style={styles.stepIndicator}>2/4</Text>

      {/* Título y descripción */}
      <Text style={styles.title}>Ubicación (opcional)</Text>
      <Text style={styles.description}>
        Esta información será utilizada para conectar a los miembros cercanos.
      </Text>

      {/* Campo de búsqueda de dirección */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Busca por dirección o barrio"
        />
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Mapa con marcador */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: selectedLocation.latitud,
          longitude: selectedLocation.longitud,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress} // Permitir seleccionar ubicaciones en el mapa
      >
        <Marker
          coordinate={{
            latitude: selectedLocation.latitud,
            longitude: selectedLocation.longitud,
          }}
          title="Ubicación seleccionada"
        />
      </MapView>

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
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 20,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFF',
  },
  settingsButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
  },
  map: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  continueButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateGroupStep3;

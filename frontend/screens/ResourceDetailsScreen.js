import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/apiConfig';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

const ResourceDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { resourceId } = route.params; // ID del recurso

  const [resource, setResource] = useState(null);
  const [selectedTab, setSelectedTab] = useState('info'); // Tabs: "info" o "reservar"
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentWeek, setCurrentWeek] = useState([]);

  useEffect(() => {
    const fetchResourceDetails = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${BASE_URL}/api/resources/${resourceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setResource(data);
      } else {
        Alert.alert('Error', 'No se pudo cargar la información del recurso.');
      }
    };

    fetchResourceDetails();
    initializeWeek(new Date());
  }, [resourceId]);

  const initializeWeek = (startDate) => {
    const week = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    setCurrentWeek(week);
  };

  const handleNextWeek = () => {
    const nextWeekStart = addDays(currentWeek[0], 7);
    initializeWeek(nextWeekStart);
  };

  const handlePreviousWeek = () => {
    const previousWeekStart = addDays(currentWeek[0], -7);
    initializeWeek(previousWeekStart);
  };

  const handleReservation = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Selecciona una fecha y hora para la reserva.');
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    const fechaInicio = new Date(selectedDate);
    fechaInicio.setHours(parseInt(selectedTime.split(':')[0]));

    const fechaFin = new Date(fechaInicio);
    fechaFin.setHours(fechaInicio.getHours() + 2); // Ejemplo: reserva de 2 horas

    try {
      const response = await fetch(`${BASE_URL}/api/loans`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recurso_id: resourceId,
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', 'Reserva realizada correctamente.');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.error || 'No se pudo realizar la reserva.');
      }
    } catch (error) {
      console.error('Error al reservar:', error);
      Alert.alert('Error', 'Ocurrió un error al realizar la reserva.');
    }
  };

  if (!resource) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con Tabs */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedTab('info')}>
          <Text style={[styles.tab, selectedTab === 'info' && styles.tabActive]}>
            Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('reservar')}>
          <Text style={[styles.tab, selectedTab === 'reservar' && styles.tabActive]}>
            Reservar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de Info */}
      {selectedTab === 'info' && (
        <ScrollView style={styles.infoContainer}>
          <Image source={{ uri: resource.fotos[0] }} style={styles.image} />
          <Text style={styles.resourceName}>{resource.nombre_recurso}</Text>
          <Text style={styles.availability}>
            {resource.estado === 'disponible' ? 'Disponible' : 'No disponible'}
          </Text>
          <Text style={styles.sectionTitle}>Información</Text>
          <Text style={styles.description}>{resource.descripcion.ops[0].insert}</Text>
          <Text style={styles.sectionTitle}>Condiciones de uso</Text>
          <Text style={styles.description}>{resource.condiciones_uso.ops[0].insert}</Text>
        </ScrollView>
      )}

      {/* Contenido de Reservar */}
      {selectedTab === 'reservar' && (
        <View style={styles.reserveContainer}>
          <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
          <View style={styles.dateNavigation}>
            <TouchableOpacity onPress={handlePreviousWeek}>
              <Text style={styles.navButton}>Anterior</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextWeek}>
              <Text style={styles.navButton}>Siguiente</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateContainer}>
            {currentWeek.map((date) => (
              <TouchableOpacity
                key={date.toISOString()}
                style={[styles.dateItem, selectedDate === date.toISOString() && styles.dateItemSelected]}
                onPress={() => setSelectedDate(date.toISOString())}
              >
                <Text style={styles.dateText}>{format(date, 'EEE dd', { locale: es })}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Selecciona una hora</Text>
          <View style={styles.timeContainer}>
            {['08:00', '10:00', '12:00', '14:00'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.timeItem, selectedTime === item && styles.timeItemSelected]}
                onPress={() => setSelectedTime(item)}
              >
                <Text style={styles.timeText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.deliveryContainer}>
            <Text style={styles.deliveryText}>Lugar de entrega y devolución:</Text>
            <Text style={styles.deliveryDetails}>Administración. Los Robles 1245 apto 001</Text>
          </View>

          <TouchableOpacity style={styles.reserveButton} onPress={handleReservation}>
            <Text style={styles.reserveButtonText}>Reservar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  tab: { padding: 10, fontSize: 16, color: '#aaa' },
  tabActive: { color: '#000', fontWeight: 'bold' },
  image: { width: '100%', height: 200, resizeMode: 'cover', marginVertical: 20 },
  resourceName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  availability: { fontSize: 16, color: '#28a745', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  description: { fontSize: 14, color: '#555', marginBottom: 20 },
  reserveContainer: { padding: 20 },
  dateNavigation: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  navButton: { fontSize: 16, color: '#007bff' },
  dateContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  dateItem: { padding: 10, borderRadius: 5, backgroundColor: '#f0f0f0' },
  dateItemSelected: { backgroundColor: '#007bff' },
  dateText: { color: '#000' },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  timeItem: { padding: 10, borderRadius: 5, backgroundColor: '#f0f0f0' },
  timeItemSelected: { backgroundColor: '#007bff' },
  timeText: { color: '#000' },
  deliveryContainer: { marginVertical: 20 },
  deliveryText: { fontSize: 16, fontWeight: 'bold' },
  deliveryDetails: { fontSize: 14, color: '#555' },
  reserveButton: { marginTop: 20, padding: 15, backgroundColor: '#007bff', borderRadius: 5 },
  reserveButtonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ResourceDetailsScreen;

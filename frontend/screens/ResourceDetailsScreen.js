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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../utils/apiConfig';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

const PLACEHOLDER_IMG = 'https://cifer.com.uy/wp-content/uploads/2018/09/5105.png';
const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

const ResourceDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { resourceId } = route.params;

  const [resource, setResource] = useState(null);
  const [selectedTab, setSelectedTab] = useState('info');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentWeek, setCurrentWeek] = useState([]);

  useEffect(() => {
    const fetchResourceDetails = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${BASE_URL}/api/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    setCurrentWeek(Array.from({ length: 7 }, (_, i) => addDays(startDate, i)));
  };

  const handleReservation = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Atención', 'Seleccioná una fecha y hora para la reserva.');
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    const fechaInicio = new Date(selectedDate);
    fechaInicio.setHours(parseInt(selectedTime.split(':')[0]));
    const fechaFin = new Date(fechaInicio);
    fechaFin.setHours(fechaInicio.getHours() + 2);

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
        Alert.alert('¡Reserva realizada!', 'Tu reserva fue registrada correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', data.error || 'No se pudo realizar la reserva.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al realizar la reserva.');
    }
  };

  if (!resource) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const coverImage = resource.fotos?.length > 0 ? resource.fotos[0] : PLACEHOLDER_IMG;
  const descripcion = typeof resource.descripcion === 'string'
    ? resource.descripcion
    : resource.descripcion?.ops?.map(op => op.insert).join('') ?? '';
  const condiciones = typeof resource.condiciones_uso === 'string'
    ? resource.condiciones_uso
    : resource.condiciones_uso?.ops?.map(op => op.insert).join('') ?? '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{resource.nombre_recurso}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'info' && styles.tabActive]}
            onPress={() => setSelectedTab('info')}
          >
            <Text style={[styles.tabText, selectedTab === 'info' && styles.tabTextActive]}>Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'reservar' && styles.tabActive]}
            onPress={() => setSelectedTab('reservar')}
          >
            <Text style={[styles.tabText, selectedTab === 'reservar' && styles.tabTextActive]}>Reservar</Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'info' && (
          <ScrollView style={styles.infoScroll} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
            <View style={styles.infoPadding}>
              <View style={styles.titleRow}>
                <Text style={styles.resourceName}>{resource.nombre_recurso}</Text>
                <View style={[styles.statusBadge, resource.estado === 'disponible' && styles.statusAvailable]}>
                  <Text style={[styles.statusText, resource.estado === 'disponible' && styles.statusTextAvailable]}>
                    {resource.estado === 'disponible' ? 'Disponible' : 'No disponible'}
                  </Text>
                </View>
              </View>

              {descripcion ? (
                <>
                  <Text style={styles.sectionTitle}>Descripción</Text>
                  <Text style={styles.bodyText}>{descripcion}</Text>
                </>
              ) : null}

              {condiciones ? (
                <>
                  <Text style={styles.sectionTitle}>Condiciones de uso</Text>
                  <Text style={styles.bodyText}>{condiciones}</Text>
                </>
              ) : null}

              <Text style={styles.sectionTitle}>Lugar de entrega</Text>
              <Text style={styles.bodyText}>
                {resource.punto_entrega?.texto ?? 'No especificado'}
              </Text>
            </View>
          </ScrollView>
        )}

        {selectedTab === 'reservar' && (
          <ScrollView style={styles.reserveScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.infoPadding}>
              <Text style={styles.sectionTitle}>Seleccioná una fecha</Text>
              <View style={styles.weekNav}>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => initializeWeek(addDays(currentWeek[0], -7))}
                >
                  <Ionicons name="chevron-back" size={18} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.navLabel}>
                  {currentWeek.length > 0
                    ? `${format(currentWeek[0], 'dd MMM', { locale: es })} – ${format(currentWeek[6], 'dd MMM', { locale: es })}`
                    : ''}
                </Text>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => initializeWeek(addDays(currentWeek[0], 7))}
                >
                  <Ionicons name="chevron-forward" size={18} color="#1E293B" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
                {currentWeek.map(date => {
                  const iso = date.toISOString();
                  const selected = selectedDate === iso;
                  return (
                    <TouchableOpacity
                      key={iso}
                      style={[styles.dateItem, selected && styles.dateItemSelected]}
                      onPress={() => setSelectedDate(iso)}
                    >
                      <Text style={[styles.dateDayName, selected && styles.dateTextSelected]}>
                        {format(date, 'EEE', { locale: es })}
                      </Text>
                      <Text style={[styles.dateNumber, selected && styles.dateTextSelected]}>
                        {format(date, 'dd')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.sectionTitle}>Seleccioná una hora</Text>
              <View style={styles.timesGrid}>
                {TIME_SLOTS.map(slot => {
                  const selected = selectedTime === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[styles.timeItem, selected && styles.timeItemSelected]}
                      onPress={() => setSelectedTime(slot)}
                    >
                      <Text style={[styles.timeText, selected && styles.timeTextSelected]}>{slot}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.deliveryBox}>
                <Ionicons name="location-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.deliveryLabel}>Lugar de entrega</Text>
                  <Text style={styles.deliveryValue}>{resource.punto_entrega?.texto ?? 'No especificado'}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.reserveButton} onPress={handleReservation}>
                <Text style={styles.reserveButtonText}>Confirmar reserva</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9EFE6' },
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#6B7280', fontSize: 15 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9EFE6',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  backButton: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  tabActive: { backgroundColor: '#1E293B' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#fff' },
  infoScroll: { flex: 1 },
  reserveScroll: { flex: 1 },
  coverImage: { width: '100%', height: 200, resizeMode: 'cover' },
  infoPadding: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  resourceName: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', flex: 1, marginRight: 10 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  statusAvailable: { backgroundColor: '#DCFCE7' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  statusTextAvailable: { color: '#16A34A' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginTop: 16, marginBottom: 8 },
  bodyText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  navLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  datesScroll: { marginBottom: 20 },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    minWidth: 52,
  },
  dateItemSelected: { backgroundColor: '#1E293B' },
  dateDayName: { fontSize: 11, color: '#6B7280', fontWeight: '600', textTransform: 'capitalize' },
  dateNumber: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 2 },
  dateTextSelected: { color: '#fff' },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  timeItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  timeItemSelected: { backgroundColor: '#1E293B' },
  timeText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  timeTextSelected: { color: '#fff' },
  deliveryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deliveryLabel: { fontSize: 12, color: '#6B7280' },
  deliveryValue: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginTop: 2 },
  reserveButton: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  reserveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ResourceDetailsScreen;

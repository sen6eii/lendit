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

const ResourceDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { resourceId } = route.params;

  const [resource, setResource] = useState(null);
  const [selectedTab, setSelectedTab] = useState('info');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startWeek, setStartWeek] = useState([]);
  const [endWeek, setEndWeek] = useState([]);

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
    const today = new Date();
    setStartWeek(Array.from({ length: 7 }, (_, i) => addDays(today, i)));
    setEndWeek(Array.from({ length: 7 }, (_, i) => addDays(today, i + 1)));
  }, [resourceId]);

  const handleStartDateSelect = (date) => {
    setStartDate(date);
    setEndDate(null);
    setEndWeek(Array.from({ length: 7 }, (_, i) => addDays(date, i + 1)));
  };

  const handleReservation = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Atención', 'Seleccioná fecha de inicio y fecha de devolución.');
      return;
    }

    const token = await AsyncStorage.getItem('userToken');
    const fechaInicio = new Date(startDate);
    fechaInicio.setHours(9, 0, 0, 0);
    const fechaFin = new Date(endDate);
    fechaFin.setHours(18, 0, 0, 0);

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
        const groupId = resource.grupo?._id ?? resource.grupo;
        Alert.alert('¡Solicitud enviada!', 'El dueño del recurso recibirá tu solicitud y la aprobará.', [
          {
            text: 'Ver mis reservas',
            onPress: () => {
              if (groupId) {
                navigation.navigate('GroupsTab', {
                  screen: 'GroupDetails',
                  params: { groupId: groupId.toString() },
                });
              } else {
                navigation.goBack();
              }
            },
          },
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
              {resource.estado !== 'disponible' && (
                <View style={styles.unavailableBanner}>
                  <Ionicons name="time-outline" size={18} color="#92400E" style={{ marginRight: 8 }} />
                  <Text style={styles.unavailableText}>Este recurso no está disponible ahora</Text>
                </View>
              )}

              <Text style={styles.sectionTitle}>Fecha de inicio</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
                {startWeek.map(date => {
                  const iso = date.toISOString();
                  const selected = startDate?.toDateString() === date.toDateString();
                  return (
                    <TouchableOpacity
                      key={iso}
                      style={[styles.dateItem, selected && styles.dateItemSelected]}
                      onPress={() => handleStartDateSelect(date)}
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

              <Text style={styles.sectionTitle}>Fecha de devolución</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
                {endWeek.map(date => {
                  const selected = endDate?.toDateString() === date.toDateString();
                  return (
                    <TouchableOpacity
                      key={date.toISOString()}
                      style={[styles.dateItem, selected && styles.dateItemSelected]}
                      onPress={() => setEndDate(date)}
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

              {startDate && endDate && (
                <View style={styles.summaryBox}>
                  <Ionicons name="calendar-outline" size={16} color="#2563EB" style={{ marginRight: 8 }} />
                  <Text style={styles.summaryText}>
                    {format(startDate, "d 'de' MMMM", { locale: es })} → {format(endDate, "d 'de' MMMM", { locale: es })}
                  </Text>
                </View>
              )}

              <View style={styles.deliveryBox}>
                <Ionicons name="location-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.deliveryLabel}>Lugar de entrega</Text>
                  <Text style={styles.deliveryValue}>{resource.punto_entrega?.texto ?? 'No especificado'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.reserveButton, resource.estado !== 'disponible' && { opacity: 0.5 }]}
                onPress={handleReservation}
                disabled={resource.estado !== 'disponible'}
              >
                <Text style={styles.reserveButtonText}>Enviar solicitud</Text>
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
  unavailableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  unavailableText: { fontSize: 13, color: '#92400E', fontWeight: '600', flex: 1 },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
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

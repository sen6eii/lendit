import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../utils/apiConfig';

const STATUS_LABEL = {
  pendiente: { label: 'Pendiente', color: '#D97706', bg: '#FEF3C7' },
  'en curso': { label: 'En curso', color: '#2563EB', bg: '#DBEAFE' },
  finalizado: { label: 'Finalizado', color: '#6B7280', bg: '#F3F4F6' },
  denegado: { label: 'Rechazado', color: '#DC2626', bg: '#FEE2E2' },
  cancelado: { label: 'Cancelado', color: '#6B7280', bg: '#F3F4F6' },
  retrasado: { label: 'Retrasado', color: '#EA580C', bg: '#FFF7ED' },
};

const MyLoansScreen = () => {
  const navigation = useNavigation();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('activo');

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${BASE_URL}/api/loans/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLoans(await res.json());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(fetchLoans);

  const activeLoans = loans.filter(l => ['pendiente', 'en curso', 'retrasado'].includes(l.estado));
  const historyLoans = loans.filter(l => ['finalizado', 'cancelado', 'denegado'].includes(l.estado));
  const displayed = activeFilter === 'activo' ? activeLoans : historyLoans;

  const renderItem = ({ item }) => {
    const s = STATUS_LABEL[item.estado] ?? { label: item.estado, color: '#6B7280', bg: '#F3F4F6' };
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resourceName}>{item.recurso_id?.nombre_recurso ?? 'Recurso'}</Text>
            <Text style={styles.cardDate}>
              {item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es') : '—'}
              {' → '}
              {item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString('es') : '—'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>
        {item.recurso_id?.grupo && (
          <TouchableOpacity
            style={styles.groupLink}
            onPress={() => navigation.navigate('GroupsTab', {
              screen: 'GroupDetails',
              params: { groupId: item.recurso_id.grupo._id ?? item.recurso_id.grupo },
            })}
          >
            <Ionicons name="people-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
            <Text style={styles.groupLinkText}>
              {item.recurso_id.grupo?.nombre_grupo ?? 'Ver grupo'}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis reservas</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filters}>
        {['activo', 'historial'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filter, activeFilter === f && styles.filterActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f === 'activo' ? `Activos (${activeLoans.length})` : `Historial (${historyLoans.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1E293B" />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={item => item._id}
          contentContainerStyle={displayed.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {activeFilter === 'activo' ? 'No tenés reservas activas' : 'Sin historial'}
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9EFE6' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backButton: { padding: 4, width: 40 },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 18, fontWeight: 'bold', color: '#1E293B',
  },
  filters: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#F9EFE6',
  },
  filter: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#E5E7EB', alignItems: 'center',
  },
  filterActive: { backgroundColor: '#1E293B' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    marginBottom: 10, overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 14, gap: 10,
  },
  resourceName: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  cardDate: { fontSize: 13, color: '#6B7280' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  groupLink: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  groupLinkText: { flex: 1, fontSize: 13, color: '#6B7280' },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});

export default MyLoansScreen;

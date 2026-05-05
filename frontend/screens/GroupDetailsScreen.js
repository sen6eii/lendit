import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../utils/apiConfig';

const PLACEHOLDER_IMG = 'https://cifer.com.uy/wp-content/uploads/2018/09/5105.png';

const GroupDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, isAdmin: initialIsAdmin } = route.params;

  const [activeTab, setActiveTab] = useState('recursos');
  const [resources, setResources] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        const [groupRes, resourcesRes, loansRes] = await Promise.all([
          fetch(`${BASE_URL}/api/groups/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/api/resources`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/api/loans/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (groupRes.ok) {
          const data = await groupRes.json();
          setGroupDetails(data);
          setIsAdmin(data.id_miembro_owner?._id?.toString() === userId);
        } else {
          Alert.alert('Error', 'No se pudo cargar la información del grupo.');
        }

        if (resourcesRes.ok) {
          const data = await resourcesRes.json();
          setResources(data.filter(r => r.grupo?._id?.toString() === groupId || r.grupo?.toString() === groupId));
        }

        if (loansRes.ok) {
          setReservations(await loansRes.json());
        }
      } catch (error) {
        Alert.alert('Error', 'Ocurrió un error al cargar los detalles.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E293B" />
        </View>
      </SafeAreaView>
    );
  }

  const tabs = isAdmin
    ? [
        { key: 'recursos', label: 'Recursos' },
        { key: 'miembros', label: 'Miembros' },
        { key: 'panelAdmin', label: 'Admin' },
      ]
    : [
        { key: 'recursos', label: 'Recursos' },
        { key: 'reservas', label: 'Reservas' },
        { key: 'historial', label: 'Historial' },
      ];

  const renderTabContent = () => {
    if (activeTab === 'recursos') {
      return (
        <FlatList
          data={resources}
          keyExtractor={item => item._id}
          contentContainerStyle={resources.length === 0 && styles.emptyContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Sin recursos</Text>
              {isAdmin && (
                <Text style={styles.emptySubtitle}>Tocá "Crear Recurso" para agregar uno</Text>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resourceItem}
              onPress={() =>
                navigation.navigate(isAdmin ? 'EditResource' : 'ResourceDetails', {
                  resourceId: item._id,
                })
              }
            >
              <Image
                source={{ uri: item.fotos?.[0] || PLACEHOLDER_IMG }}
                style={styles.resourceImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.resourceName}>{item.nombre_recurso}</Text>
                <Text style={[styles.resourceStatus, item.estado === 'disponible' && styles.available]}>
                  {item.estado === 'disponible' ? 'Disponible' : 'No disponible'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        />
      );
    }

    if (activeTab === 'panelAdmin') {
      return (
        <View style={styles.adminPanel}>
          <Text style={styles.adminLabel}>Código de acceso</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{groupDetails?.grupo_codigo ?? '—'}</Text>
          </View>
          <Text style={styles.adminHint}>
            Compartí este código para que otros usuarios puedan unirse al grupo.
          </Text>
        </View>
      );
    }

    if (activeTab === 'miembros') {
      const miembros = groupDetails?.miembros ?? [];
      return (
        <FlatList
          data={miembros}
          keyExtractor={item => item._id ?? item.toString()}
          contentContainerStyle={miembros.length === 0 && styles.emptyContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Sin miembros</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {(item.nombre ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.memberName}>{item.nombre ?? 'Usuario'}</Text>
                <Text style={styles.memberEmail}>{item.email ?? ''}</Text>
              </View>
            </View>
          )}
        />
      );
    }

    const filtered = reservations.filter(res =>
      activeTab === 'reservas' ? res.estado !== 'finalizado' : res.estado === 'finalizado'
    );
    return (
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={filtered.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'reservas' ? 'No tenés reservas activas' : 'No tenés historial'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.loanItem}>
            <Text style={styles.loanName}>{item.recurso_id?.nombre_recurso ?? 'Recurso'}</Text>
            <Text style={styles.loanStatus}>Estado: {item.estado}</Text>
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {groupDetails?.nombre_grupo ?? 'Grupo'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tabsRow}>
          {tabs.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>{renderTabContent()}</View>

        {isAdmin && activeTab === 'recursos' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateResource', { groupId })}
          >
            <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.addButtonText}>Crear Recurso</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9EFE6' },
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  tabActive: { backgroundColor: '#1E293B' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#fff' },
  content: { flex: 1 },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resourceImage: { width: 44, height: 44, borderRadius: 8, marginRight: 12, backgroundColor: '#E5E7EB' },
  resourceName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  resourceStatus: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  available: { color: '#16A34A' },
  loanItem: {
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loanName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  loanStatus: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  emptyContainer: { flex: 1 },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginTop: 12, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    margin: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  adminPanel: { padding: 20 },
  adminLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  codeBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  codeText: { fontSize: 32, fontWeight: 'bold', letterSpacing: 8, color: '#1E293B' },
  adminHint: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  memberName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  memberEmail: { fontSize: 13, color: '#6B7280' },
});

export default GroupDetailsScreen;

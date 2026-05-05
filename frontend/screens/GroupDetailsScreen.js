import React, { useState, useEffect, useCallback } from 'react';
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
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../utils/apiConfig';

const PLACEHOLDER_IMG = 'https://cifer.com.uy/wp-content/uploads/2018/09/5105.png';

const STATUS_LABEL = {
  pendiente: { label: 'Pendiente', color: '#D97706', bg: '#FEF3C7' },
  'en curso': { label: 'En curso', color: '#2563EB', bg: '#DBEAFE' },
  finalizado: { label: 'Finalizado', color: '#6B7280', bg: '#F3F4F6' },
  denegado: { label: 'Denegado', color: '#DC2626', bg: '#FEE2E2' },
  cancelado: { label: 'Cancelado', color: '#6B7280', bg: '#F3F4F6' },
  retrasado: { label: 'Retrasado', color: '#EA580C', bg: '#FFF7ED' },
};

const GroupDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, isAdmin: initialIsAdmin } = route.params;

  const [activeTab, setActiveTab] = useState('recursos');
  const [resources, setResources] = useState([]);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [myLoans, setMyLoans] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('userId');

      const [groupRes, resourcesRes, loansRes] = await Promise.all([
        fetch(`${BASE_URL}/api/groups/${groupId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/resources`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/loans/user`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (groupRes.ok) {
        const data = await groupRes.json();
        setGroupDetails(data);
        const adminCheck = data.id_miembro_owner?._id?.toString() === userId;
        setIsAdmin(adminCheck);

        if (adminCheck) {
          const pendingRes = await fetch(`${BASE_URL}/api/loans/group/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (pendingRes.ok) {
            const all = await pendingRes.json();
            setPendingLoans(all.filter(l => l.estado === 'pendiente'));
          }
        }
      }

      if (resourcesRes.ok) {
        const data = await resourcesRes.json();
        setResources(data.filter(r =>
          r.grupo?._id?.toString() === groupId || r.grupo?.toString() === groupId
        ));
      }

      if (loansRes.ok) {
        setMyLoans(await loansRes.json());
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useFocusEffect(loadData);

  const handleApproveLoan = async (loanId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${BASE_URL}/api/loans/${loanId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Aprobado', 'El préstamo fue aprobado correctamente.');
        setPendingLoans(prev => prev.filter(l => l._id !== loanId));
        loadData();
      } else {
        Alert.alert('Error', data.error || 'No se pudo aprobar el préstamo.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  const handleDenyLoan = async (loanId) => {
    Alert.alert('Denegar solicitud', '¿Seguro que querés denegar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Denegar',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${BASE_URL}/api/loans/${loanId}/deny`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
              Alert.alert('Denegado', 'La solicitud fue rechazada.');
              setPendingLoans(prev => prev.filter(l => l._id !== loanId));
              loadData();
            } else {
              Alert.alert('Error', data.error || 'No se pudo denegar el préstamo.');
            }
          } catch {
            Alert.alert('Error', 'No se pudo conectar con el servidor.');
          }
        },
      },
    ]);
  };

  const handleCancelLoan = async (loanId) => {
    Alert.alert('Cancelar reserva', '¿Querés cancelar esta reserva?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${BASE_URL}/api/loans/${loanId}/cancel`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
              loadData();
            } else {
              Alert.alert('Error', data.error || 'No se pudo cancelar la reserva.');
            }
          } catch {
            Alert.alert('Error', 'No se pudo conectar con el servidor.');
          }
        },
      },
    ]);
  };

  const handleLeaveGroup = () => {
    Alert.alert('Salir del grupo', '¿Seguro que querés abandonar este grupo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${BASE_URL}/api/groups/${groupId}/leave`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
              navigation.replace('MainTabs', { screen: 'GroupsTab' });
            } else {
              Alert.alert('Error', data.error || 'No se pudo salir del grupo.');
            }
          } catch {
            Alert.alert('Error', 'No se pudo conectar con el servidor.');
          }
        },
      },
    ]);
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Eliminar grupo',
      '¿Seguro que querés eliminar este grupo? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const res = await fetch(`${BASE_URL}/api/groups/${groupId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (res.ok) {
                navigation.replace('MainTabs', { screen: 'GroupsTab' });
              } else {
                Alert.alert('Error', data.error || 'No se pudo eliminar el grupo.');
              }
            } catch {
              Alert.alert('Error', 'No se pudo conectar con el servidor.');
            }
          },
        },
      ]
    );
  };

  const handleCompleteLoan = async (loanId) => {
    Alert.alert('Finalizar préstamo', '¿El recurso fue devuelto correctamente?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, finalizar',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${BASE_URL}/api/loans/${loanId}/confirm`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
              loadData();
            } else {
              Alert.alert('Error', data.error || 'No se pudo finalizar el préstamo.');
            }
          } catch {
            Alert.alert('Error', 'No se pudo conectar con el servidor.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E293B" />
        </View>
      </SafeAreaView>
    );
  }

  const groupLoans = myLoans.filter(l =>
    resources.some(r => r._id === l.recurso_id?._id || r._id === l.recurso_id)
  );
  const activeLoans = groupLoans.filter(l => !['finalizado', 'cancelado', 'denegado'].includes(l.estado));
  const historyLoans = groupLoans.filter(l => ['finalizado', 'cancelado', 'denegado'].includes(l.estado));

  const adminTabs = [
    { key: 'recursos', label: 'Recursos' },
    { key: 'solicitudes', label: `Solicitudes${pendingLoans.length > 0 ? ` (${pendingLoans.length})` : ''}` },
    { key: 'miembros', label: 'Miembros' },
    { key: 'codigo', label: 'Código' },
  ];
  const memberTabs = [
    { key: 'recursos', label: 'Recursos' },
    { key: 'reservas', label: 'Mis reservas' },
    { key: 'historial', label: 'Historial' },
  ];
  const tabs = isAdmin ? adminTabs : memberTabs;

  const renderTabContent = () => {
    if (activeTab === 'recursos') {
      return (
        <FlatList
          data={resources}
          keyExtractor={item => item._id}
          contentContainerStyle={resources.length === 0 ? styles.emptyContainer : { paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Sin recursos</Text>
              {isAdmin && <Text style={styles.emptySubtitle}>Tocá "Agregar recurso" para crear uno</Text>}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate(isAdmin ? 'EditResource' : 'ResourceDetails', { resourceId: item._id })}
            >
              <Image source={{ uri: item.fotos?.[0] || PLACEHOLDER_IMG }} style={styles.resourceImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.nombre_recurso}</Text>
                <View style={[styles.badge, item.estado === 'disponible' ? styles.badgeGreen : styles.badgeGray]}>
                  <Text style={[styles.badgeText, item.estado === 'disponible' ? styles.badgeTextGreen : styles.badgeTextGray]}>
                    {item.estado === 'disponible' ? 'Disponible' : 'En préstamo'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        />
      );
    }

    if (activeTab === 'solicitudes') {
      return (
        <FlatList
          data={pendingLoans}
          keyExtractor={item => item._id}
          contentContainerStyle={pendingLoans.length === 0 ? styles.emptyContainer : { padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Sin solicitudes pendientes</Text>
              <Text style={styles.emptySubtitle}>Cuando alguien pida un recurso, aparecerá aquí</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.loanCard}>
              <View style={styles.loanCardHeader}>
                <Text style={styles.cardTitle}>{item.recurso_id?.nombre_recurso ?? 'Recurso'}</Text>
                <Text style={styles.loanSubtitle}>
                  Solicitante: {item.prestatario?.nombre ?? '—'}
                </Text>
                <Text style={styles.loanDate}>
                  {item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es') : '—'} →{' '}
                  {item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString('es') : '—'}
                </Text>
              </View>
              <View style={styles.loanActions}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveLoan(item._id)}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.approveBtnText}>Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.denyBtn} onPress={() => handleDenyLoan(item._id)}>
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.denyBtnText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      );
    }

    if (activeTab === 'codigo') {
      return (
        <View style={styles.adminPanel}>
          <Text style={styles.adminLabel}>Código de acceso</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{groupDetails?.grupo_codigo ?? '—'}</Text>
          </View>
          <Text style={styles.adminHint}>
            Compartí este código para que otros usuarios puedan unirse al grupo.
          </Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteGroup}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.dangerButtonText}>Eliminar grupo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'miembros') {
      const miembros = groupDetails?.miembros ?? [];
      return (
        <FlatList
          data={miembros}
          keyExtractor={item => item._id ?? item.toString()}
          contentContainerStyle={miembros.length === 0 ? styles.emptyContainer : { padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Sin miembros</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{(item.nombre ?? 'U')[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>{item.nombre ?? 'Usuario'}</Text>
                <Text style={styles.loanSubtitle}>{item.email ?? ''}</Text>
              </View>
            </View>
          )}
        />
      );
    }

    const loans = activeTab === 'reservas' ? activeLoans : historyLoans;
    return (
      <FlatList
        data={loans}
        keyExtractor={item => item._id}
        contentContainerStyle={loans.length === 0 ? styles.emptyContainer : { padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'reservas' ? 'Sin reservas activas' : 'Sin historial'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusInfo = STATUS_LABEL[item.estado] ?? { label: item.estado, color: '#6B7280', bg: '#F3F4F6' };
          return (
            <View style={styles.loanCard}>
              <View style={styles.loanCardHeader}>
                <Text style={styles.cardTitle}>{item.recurso_id?.nombre_recurso ?? 'Recurso'}</Text>
                <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
                <Text style={styles.loanDate}>
                  {item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es') : '—'} →{' '}
                  {item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString('es') : '—'}
                </Text>
              </View>
              {item.estado === 'pendiente' && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelLoan(item._id)}>
                  <Text style={styles.cancelBtnText}>Cancelar solicitud</Text>
                </TouchableOpacity>
              )}
              {item.estado === 'en curso' && (
                <TouchableOpacity style={styles.completeBtn} onPress={() => handleCompleteLoan(item._id)}>
                  <Text style={styles.completeBtnText}>Marcar como devuelto</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
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
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]} numberOfLines={1}>
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
            <Text style={styles.addButtonText}>Agregar recurso</Text>
          </TouchableOpacity>
        )}
        {!isAdmin && activeTab === 'recursos' && (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
            <Ionicons name="exit-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.leaveButtonText}>Salir del grupo</Text>
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
  backButton: { padding: 4, width: 40 },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  tabActive: { backgroundColor: '#1E293B' },
  tabText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#fff' },
  content: { flex: 1 },
  card: {
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
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeGray: { backgroundColor: '#F3F4F6' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextGreen: { color: '#16A34A' },
  badgeTextGray: { color: '#6B7280' },
  loanCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    overflow: 'hidden',
  },
  loanCardHeader: { padding: 14 },
  loanSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  loanDate: { fontSize: 12, color: '#9CA3AF' },
  loanActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    padding: 10,
    backgroundColor: '#16A34A',
  },
  approveBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  denyBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    padding: 10,
    backgroundColor: '#DC2626',
  },
  denyBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  cancelBtn: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  completeBtn: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  completeBtnText: { color: '#16A34A', fontWeight: '600', fontSize: 13 },
  emptyContainer: { flex: 1 },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginTop: 12, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  addButton: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  leaveButton: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  leaveButtonText: { color: '#DC2626', fontWeight: 'bold', fontSize: 15 },
  dangerButton: {
    flexDirection: 'row',
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEE2E2',
  },
  dangerButtonText: { color: '#DC2626', fontWeight: 'bold', fontSize: 15 },
  adminPanel: { padding: 24 },
  adminLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    marginBottom: 14,
  },
  codeText: { fontSize: 34, fontWeight: 'bold', letterSpacing: 8, color: '#1E293B' },
  adminHint: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
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
});

export default GroupDetailsScreen;

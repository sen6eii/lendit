import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../utils/apiConfig';

const TIPO_LABELS = {
  vecinal: 'Vecinal',
  familiar: 'Familiar',
  laboral: 'Laboral',
  educativo: 'Educativo',
  deportivo: 'Deportivo',
  otro: 'Otro',
};

const ExploreGroupsScreen = () => {
  const navigation = useNavigation();
  const [groups, setGroups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const [token, uid] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userId'),
      ]);
      setUserId(uid);

      const response = await fetch(`${BASE_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const publicGroups = data.filter(g => !g.grupo_privado);
        setGroups(publicGroups);
        setFiltered(publicGroups);
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchGroups(); }, []));

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFiltered(groups);
      return;
    }
    const q = text.toLowerCase();
    setFiltered(groups.filter(g =>
      g.nombre_grupo?.toLowerCase().includes(q) ||
      g.ubicacion?.barrio?.toLowerCase().includes(q) ||
      g.ubicacion?.direccion?.toLowerCase().includes(q)
    ));
  };

  const isMember = (group) => {
    if (!userId) return false;
    return group.miembros?.some(m =>
      m._id?.toString() === userId || m.toString() === userId
    );
  };

  const handleJoin = (group) => {
    navigation.navigate('JoinCommunityConfirmation', { accessCode: group.grupo_codigo });
  };

  const locationText = (group) => {
    const parts = [group.ubicacion?.direccion, group.ubicacion?.barrio].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const renderItem = ({ item }) => {
    const member = isMember(item);
    const loc = locationText(item);
    const tipo = (item.tipo_comunidad || []).map(t => TIPO_LABELS[t] || t).join(', ');

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.nombre_grupo?.charAt(0)?.toUpperCase() || 'G'}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.groupName} numberOfLines={1}>{item.nombre_grupo}</Text>
            {loc ? <Text style={styles.groupSub} numberOfLines={1}>{loc}</Text> : null}
            {tipo ? <Text style={styles.groupTipo}>{tipo}</Text> : null}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.memberBadge}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.memberCount}>{item.miembros?.length || 0} miembros</Text>
          </View>
          {member ? (
            <View style={styles.joinedBadge}>
              <Ionicons name="checkmark" size={14} color="#059669" />
              <Text style={styles.joinedText}>Ya sos miembro</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.joinButton} onPress={() => handleJoin(item)}>
              <Text style={styles.joinButtonText}>Unirse</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explorar comunidades</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o barrio..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1E293B" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="globe-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No se encontraron comunidades públicas</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: { padding: 4 },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 18, fontWeight: 'bold', color: '#1E293B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: '#1E293B', fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  groupName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  groupSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  groupTipo: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberCount: { fontSize: 13, color: '#6B7280' },
  joinedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  joinedText: { fontSize: 13, color: '#059669', fontWeight: '600' },
  joinButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  joinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF', textAlign: 'center' },
});

export default ExploreGroupsScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { BASE_URL } from '../utils/apiConfig';

const GroupsScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [selectedTab, setSelectedTab] = useState('todos');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);

      const response = await fetch(`${BASE_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setGroups(data);
      }
    } catch (error) {
      console.error('Error al obtener grupos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchGroups);

  const isOwner = (group, uid) =>
    group.id_miembro_owner?._id?.toString() === uid ||
    group.id_miembro_owner?.toString() === uid;

  const isMember = (group, uid) =>
    group.miembros.some(m => m._id?.toString() === uid || m.toString() === uid);

  const filteredGroups = groups.filter(group => {
    if (selectedTab === 'todos') return isOwner(group, userId) || isMember(group, userId);
    return isOwner(group, userId);
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Grupos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')}>
            <Ionicons name="add-circle-outline" size={30} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'todos' && styles.tabActive]}
            onPress={() => setSelectedTab('todos')}
          >
            <Text style={[styles.tabText, selectedTab === 'todos' && styles.tabTextActive]}>
              Mis grupos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'administrados' && styles.tabActive]}
            onPress={() => setSelectedTab('administrados')}
          >
            <Text style={[styles.tabText, selectedTab === 'administrados' && styles.tabTextActive]}>
              Administrados
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#1E293B" />
        ) : (
          <FlatList
            data={filteredGroups}
            keyExtractor={item => item._id}
            contentContainerStyle={filteredGroups.length === 0 && styles.emptyContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>
                  {selectedTab === 'todos' ? 'No pertenecés a ningún grupo' : 'No administrás ningún grupo'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {selectedTab === 'todos'
                    ? 'Creá uno nuevo o unite con un código'
                    : 'Creá un grupo tocando el + de arriba'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.groupItem}
                onPress={() =>
                  navigation.navigate('GroupDetails', {
                    groupId: item._id,
                    isAdmin: isOwner(item, userId),
                  })
                }
              >
                <View style={styles.groupItemLeft}>
                  <Image source={{ uri: item.foto_grupo }} style={styles.groupImage} />
                  <View>
                    <Text style={styles.groupName}>{item.nombre_grupo}</Text>
                    <Text style={styles.groupRole}>
                      {isOwner(item, userId) ? 'Administrador' : 'Miembro'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => navigation.navigate('JoinCommunity')}
        >
          <Ionicons name="enter-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.joinButtonText}>Unirse con código</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9EFE6',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9EFE6',
    paddingVertical: 16,
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#1E293B',
  },
  tabText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fff',
  },
  loader: { marginTop: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 16, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 6, textAlign: 'center' },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  groupItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  groupName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  groupRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  joinButton: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    margin: 16,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default GroupsScreen;

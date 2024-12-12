import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../utils/apiConfig';

const GroupsScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [selectedTab, setSelectedTab] = useState('todos'); // 'todos' o 'administrados'
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const id = await AsyncStorage.getItem('userId'); // Obtener userId
      setUserId(id);

      const response = await fetch(`${BASE_URL}/api/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setGroups(data);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(group => {
    if (selectedTab === 'todos') {
      // Mostrar todos los grupos donde el usuario es miembro o administrador
      return (
        group.id_miembro_owner === userId ||
        group.miembros.some(miembro => miembro._id === userId)
      );
    }
    // Mostrar solo grupos administrados por el usuario
    return group.id_miembro_owner === userId;
  });

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grupos</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateGroup')}>
          <Ionicons name="add-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Tabs para 'Todos' y 'Administrados' */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'todos' && styles.tabActive]}
          onPress={() => setSelectedTab('todos')}
        >
          <Text style={[styles.tabText, selectedTab === 'todos' && styles.tabTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'administrados' && styles.tabActive]}
          onPress={() => setSelectedTab('administrados')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'administrados' && styles.tabTextActive,
            ]}
          >
            Administrados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de grupos */}
      <FlatList
        data={filteredGroups}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupItem}
            onPress={() =>
              navigation.navigate('GroupDetails', {
                groupId: item._id,
                isAdmin: item.id_miembro_owner === userId,
              })
            }
          >
            <View style={styles.groupItemLeft}>
              <Image source={{ uri: item.foto_grupo }} style={styles.groupImage} />
              <View>
                <Text style={styles.groupName}>{item.nombre_grupo}</Text>
                <Text style={styles.groupRole}>
                  {item.id_miembro_owner === userId ? 'Administrador' : 'Miembro'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9EFE6',
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 15,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tabText: {
    color: '#000',
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupRole: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default GroupsScreen;
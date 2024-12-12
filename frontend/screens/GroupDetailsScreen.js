import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../utils/apiConfig';

const GroupDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, isAdmin: initialIsAdmin } = route.params;

  const [activeTab, setActiveTab] = useState('recursos'); // Tabs
  const [resources, setResources] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        const response = await fetch(`${BASE_URL}/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          setGroupDetails(data);
          setIsAdmin(data.id_miembro_owner?.['_id'] === userId);
        } else {
          Alert.alert('Error', 'No se pudo cargar la información del grupo.');
        }
      } catch (error) {
        console.error('Error al obtener detalles del grupo:', error);
        Alert.alert('Error', 'Ocurrió un error al cargar los detalles del grupo.');
      }
    };

    const fetchResources = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${BASE_URL}/api/resources`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          const groupResources = data.filter(
            (resource) => resource.grupo._id === groupId
          );
          setResources(groupResources);
        } else {
          Alert.alert('Error', 'No se pudieron cargar los recursos.');
        }
      } catch (error) {
        console.error('Error al obtener recursos:', error);
        Alert.alert('Error', 'Ocurrió un error al cargar los recursos.');
      }
    };

    const fetchReservations = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${BASE_URL}/api/loans/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setReservations(data);
        } else {
          Alert.alert('Error', 'No se pudieron cargar las reservas.');
        }
      } catch (error) {
        console.error('Error al obtener reservas:', error);
        Alert.alert('Error', 'Ocurrió un error al cargar las reservas.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
    fetchResources();
    fetchReservations();
  }, [groupId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    if (activeTab === 'recursos') {
      return (
        <FlatList
          data={resources}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resourceItem}
              onPress={() =>
                navigation.navigate(
                  isAdmin ? 'EditResource' : 'ResourceDetails',
                  { resourceId: item._id }
                )
              }
            >
              <Image source={{ uri: item.fotos[0] }} style={styles.resourceImage} />
              <View>
                <Text style={styles.resourceName}>{item.nombre_recurso}</Text>
                <Text style={styles.resourceStatus}>
                  {item.estado === 'disponible' ? 'Disponible' : 'No disponible'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      );
    }
    if (activeTab === 'panelAdmin' && isAdmin) {
      return (
        <View style={styles.placeholder}>
          <Text>Opciones del Administrador</Text>
        </View>
      );
    }
    if (activeTab === 'miembros' && isAdmin) {
      return (
        <View style={styles.placeholder}>
          <Text>Listado de miembros</Text>
        </View>
      );
    }
    if (activeTab === 'reservas') {
      const currentReservations = reservations.filter(
        (res) => res.estado !== 'finalizado'
      );
      return (
        <FlatList
          data={currentReservations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.loanItem}>
              <Text style={styles.loanName}>{item.recurso_id.nombre_recurso}</Text>
              <Text style={styles.loanStatus}>Estado: {item.estado}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes reservas activas.</Text>
          }
        />
      );
    }
    if (activeTab === 'historial') {
      const completedReservations = reservations.filter(
        (res) => res.estado === 'finalizado'
      );
      return (
        <FlatList
          data={completedReservations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.loanItem}>
              <Text style={styles.loanName}>{item.recurso_id.nombre_recurso}</Text>
              <Text style={styles.loanStatus}>Estado: {item.estado}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes historial de reservas.</Text>
          }
        />
      );
    }
    return <Text>Contenido no encontrado.</Text>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setActiveTab('recursos')}>
          <Text style={[styles.tab, activeTab === 'recursos' && styles.tabActive]}>
            Recursos
          </Text>
        </TouchableOpacity>
        {isAdmin ? (
          <>
            <TouchableOpacity onPress={() => setActiveTab('panelAdmin')}>
              <Text style={[styles.tab, activeTab === 'panelAdmin' && styles.tabActive]}>
                Panel Admin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('miembros')}>
              <Text style={[styles.tab, activeTab === 'miembros' && styles.tabActive]}>
                Miembros
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setActiveTab('reservas')}>
              <Text style={[styles.tab, activeTab === 'reservas' && styles.tabActive]}>
                Mis Reservas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('historial')}>
              <Text style={[styles.tab, activeTab === 'historial' && styles.tabActive]}>
                Historial
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.content}>{renderTabContent()}</View>

      {isAdmin && activeTab === 'recursos' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateResource', { groupId })}
        >
          <Text style={styles.addButtonText}>+ Crear Recurso</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: { fontSize: 16, color: '#aaa' },
  tabActive: { color: '#000', fontWeight: 'bold', borderBottomWidth: 2, borderColor: '#000' },
  content: { flex: 1, padding: 10 },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resourceImage: { width: 40, height: 40, marginRight: 10 },
  resourceName: { fontSize: 16, fontWeight: 'bold' },
  resourceStatus: { fontSize: 12, color: '#6b7280' },
  loanItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  loanName: { fontSize: 16, fontWeight: 'bold' },
  loanStatus: { fontSize: 12, color: '#6b7280' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default GroupDetailsScreen;

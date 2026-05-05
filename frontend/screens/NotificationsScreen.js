import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../utils/apiConfig';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchNotifications(); }, []));

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await fetch(`${BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, leida: true } : n)
      );
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return 'Ahora';
    if (diff < 60) return `Hace ${diff} min`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
    return `Hace ${Math.floor(diff / 1440)}d`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#1E293B" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          contentContainerStyle={notifications.length === 0 && styles.emptyContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No tenés notificaciones</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.leida && styles.cardUnread]}
              onPress={() => handleMarkRead(item._id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <Ionicons
                  name={item.tipo === 'loan_request' ? 'swap-horizontal' : 'information-circle'}
                  size={22}
                  color={item.leida ? '#9CA3AF' : '#1E293B'}
                  style={styles.icon}
                />
                <View style={styles.textContainer}>
                  <Text style={[styles.message, !item.leida && styles.messageUnread]}>
                    {item.mensaje}
                  </Text>
                  <Text style={styles.time}>{timeAgo(item.fecha)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item._id)}>
                <Ionicons name="close-circle-outline" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#F9EFE6',
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  loader: { marginTop: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
  card: {
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
  cardUnread: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { marginRight: 12 },
  textContainer: { flex: 1 },
  message: { fontSize: 14, color: '#6B7280' },
  messageUnread: { color: '#1E293B', fontWeight: '600' },
  time: { fontSize: 12, color: '#9CA3AF', marginTop: 3 },
});

export default NotificationsScreen;

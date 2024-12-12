import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Te has unido a un grupo!',
      description: 'Ver más',
    },
  ]);

  const handleRemoveNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      <Text style={styles.sectionTitle}>Hoy</Text>

      {notifications.map((notification) => (
        <View key={notification.id} style={styles.notificationCard}>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationDescription}>{notification.description}</Text>
          </View>
          <TouchableOpacity onPress={() => handleRemoveNotification(notification.id)}>
            <Ionicons name="close-circle-outline" size={20} color="black" />
          </TouchableOpacity>
        </View>
      ))}
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
  sectionTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginHorizontal: 25,
    marginVertical: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 25,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default NotificationsScreen;

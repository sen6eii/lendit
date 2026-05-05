import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../utils/apiConfig';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=1E293B&color=fff&size=100&name=U';

const Home = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('userToken');

        if (!userId || !token) {
          navigation.replace('Login');
          return;
        }

        const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.nombre || 'Usuario');
          setProfileImage(userData.foto_perfil || '');
        }
      } catch (error) {
        console.error('Error al obtener usuario:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'isFirstTime', 'userId']);
    navigation.replace('Login');
  };

  const avatarUri = profileImage || `https://ui-avatars.com/api/?background=1E293B&color=fff&size=100&name=${encodeURIComponent(userName || 'U')}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LendIt</Text>
          <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(!showMenu)}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {showMenu && (
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.menuItemText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeLabel}>Bienvenido,</Text>
          <Text style={styles.welcomeName}>{userName}</Text>
        </View>

        {/* Profile card */}
        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: avatarUri }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileSubtext}>Ver y editar perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Shortcuts */}
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <View style={styles.shortcutsGrid}>
          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('GroupsTab')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={24} color="#2563EB" />
            </View>
            <Text style={styles.shortcutText}>Mis comunidades</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('GroupsTab')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="construct" size={24} color="#16A34A" />
            </View>
            <Text style={styles.shortcutText}>Reservar recurso</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('GroupsTab')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="calendar" size={24} color="#EA580C" />
            </View>
            <Text style={styles.shortcutText}>Mis reservas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('JoinCommunity')}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#FDF4FF' }]}>
              <Ionicons name="enter" size={24} color="#9333EA" />
            </View>
            <Text style={styles.shortcutText}>Unirse con código</Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => Alert.alert('Soporte', 'Contactá a soporte@lendit.app')}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.supportButtonText}>Soporte y ayuda</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9EFE6' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9EFE6',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  menuButton: { padding: 4 },
  menuContainer: {
    position: 'absolute',
    top: 56,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuItemText: { color: '#EF4444', fontWeight: '600' },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  welcomeLabel: { fontSize: 14, color: '#6B7280' },
  welcomeName: { fontSize: 26, fontWeight: 'bold', color: '#1E293B', marginTop: 2 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 28,
    marginTop: 4,
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    backgroundColor: '#E5E7EB',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  profileSubtext: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 24,
    gap: 10,
  },
  shortcutCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  shortcutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  supportButton: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  supportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default Home;

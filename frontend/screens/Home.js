import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../utils/apiConfig';

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
          Alert.alert('Error', 'No se pudo autenticar al usuario. Inicia sesión nuevamente.');
          navigation.replace('Login');
          return;
        }

        const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.nombre || 'Usuario');
          setProfileImage(userData.foto_perfil || 'https://via.placeholder.com/100x100.png?text=User');
        } else {
          Alert.alert('Error', 'No se pudo obtener la información del usuario.');
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo conectar con el servidor.');
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('isFirstTime');
    await AsyncStorage.removeItem('userId');
    navigation.replace('Login');
  };

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LendIt!</Text>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Ionicons name="ellipsis-horizontal" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Menú desplegable */}
      {showMenu && (
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuItemText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contenido principal */}
      <Text style={styles.welcomeText}>Bienvenido, {userName}</Text>

      <View style={styles.profileContainer}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <Text style={styles.profileText}>Mi perfil</Text>
      </View>

      <Text style={styles.subTitle}>Atajos</Text>

      <View style={styles.shortcutsContainer}>
        <TouchableOpacity style={styles.shortcut}>
          <Image
            source={{ uri: 'https://vecinfy.com/wp-content/uploads/2024/05/%C2%BFQue-es-una-comunidad-de-vecinos-Derechos-y-obligaciones.-jpg-900x675.jpg' }}
            style={styles.shortcutImage}
          />
          <Text style={styles.shortcutText}>Comunidades cerca</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcut}>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Hand_tools.jpg/800px-Hand_tools.jpg' }}
            style={styles.shortcutImage}
          />
          <Text style={styles.shortcutText}>Reservar un recurso</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcut}>
          <Image
            source={{ uri: 'https://es.mobiletransaction.org/wp-content/uploads/sites/8/2023/12/Sistemas-de-reservas-para-empresas.jpg.webp' }}
            style={styles.shortcutImage}
          />
          <Text style={styles.shortcutText}>Mis reservas</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.supportButton}>
        <Text style={styles.supportButtonText}>Soporte y ayuda</Text>
        <Ionicons name="reload" size={20} color="#fff" style={styles.reloadIcon} />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    backgroundColor: '#F9EFE6',
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    position: 'absolute',
    right: 20,
  },
  menuContainer: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 999,
  },
  menuItem: {
    padding: 12,
  },
  menuItemText: {
    color: '#333',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 25,
    marginTop: 30,
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 25,
    marginBottom: 40,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    backgroundColor: '#ccc',
  },
  profileText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 25,
    marginBottom: 15,
  },
  shortcutsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 25,
    marginBottom: 40,
  },
  shortcut: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  shortcutImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  shortcutText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  supportButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 25,
  },
  supportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  reloadIcon: {
    marginLeft: 10,
  },
});

export default Home;

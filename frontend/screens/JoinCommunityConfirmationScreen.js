import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../utils/apiConfig';

const TIPO_LABELS = {
  'barrio cerrado': 'Barrio cerrado',
  'edificio': 'Edificio',
  'coworking': 'Coworking',
  'universidad': 'Universidad',
  'otro': 'Otro',
};

const JoinCommunityConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accessCode } = route.params;
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateGroupCode = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${BASE_URL}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groups = await response.json();

        if (response.ok) {
          const match = groups.find(g => g.grupo_codigo === accessCode);
          if (match) {
            setGroupDetails(match);
          } else {
            Alert.alert('Código inválido', 'No se encontró ningún grupo con ese código.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          }
        } else {
          Alert.alert('Error', 'No se pudo verificar el código.');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo conectar con el servidor.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    validateGroupCode();
  }, [accessCode, navigation]);

  const handleJoin = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const miembroId = await AsyncStorage.getItem('userId');

      const response = await fetch(`${BASE_URL}/api/groups/${groupDetails._id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ miembro_id: miembroId }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('¡Listo!', 'Te uniste a la comunidad correctamente.', [
          { text: 'OK', onPress: () => navigation.replace('MainTabs', { screen: 'GroupsTab' }) },
        ]);
      } else {
        Alert.alert('Error', result.error || 'No se pudo unir a la comunidad.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E293B" />
          <Text style={styles.loadingText}>Verificando código...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!groupDetails) return null;

  const tipoLabel = groupDetails.tipo_comunidad
    ?.map(t => TIPO_LABELS[t] || t)
    .join(', ') || '—';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.badge}>
            <Ionicons name="people" size={32} color="#1E293B" />
          </View>

          <Text style={styles.preTitle}>Te estás uniendo a</Text>
          <Text style={styles.groupName}>{groupDetails.nombre_grupo}</Text>

          <View style={styles.detailsCard}>
            <DetailRow icon="grid-outline" label="Tipo" value={tipoLabel} />
            <DetailRow
              icon="location-outline"
              label="Ubicación"
              value={
                [groupDetails.ubicacion?.direccion, groupDetails.ubicacion?.barrio]
                  .filter(Boolean)
                  .join(', ') || 'No especificada'
              }
            />
            <DetailRow
              icon={groupDetails.grupo_privado ? 'lock-closed-outline' : 'globe-outline'}
              label="Privacidad"
              value={groupDetails.grupo_privado ? 'Grupo cerrado' : 'Grupo público'}
            />
            <DetailRow
              icon="people-outline"
              label="Miembros"
              value={`${groupDetails.miembros?.length ?? 0} miembro${groupDetails.miembros?.length !== 1 ? 's' : ''}`}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleJoin}>
            <Text style={styles.buttonText}>Unirme al grupo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={18} color="#6B7280" style={styles.detailIcon} />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF6EE' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#6B7280' },
  backButton: { padding: 20, paddingBottom: 0 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  badge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  preTitle: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  groupName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIcon: { marginRight: 10 },
  detailLabel: { fontSize: 14, color: '#6B7280', width: 80 },
  detailValue: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  button: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default JoinCommunityConfirmationScreen;

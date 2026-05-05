import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../utils/apiConfig';

const EditResourceScreen = ({ route, navigation }) => {
  const { resourceId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [condiciones, setCondiciones] = useState('');
  const [puntoEntrega, setPuntoEntrega] = useState('');
  const [estado, setEstado] = useState('disponible');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${BASE_URL}/api/resources/${resourceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          setNombre(data.nombre_recurso ?? '');
          setDescripcion(
            typeof data.descripcion === 'string'
              ? data.descripcion
              : data.descripcion?.ops?.map(op => op.insert).join('') ?? ''
          );
          setCondiciones(
            typeof data.condiciones_uso === 'string'
              ? data.condiciones_uso
              : data.condiciones_uso?.ops?.map(op => op.insert).join('') ?? ''
          );
          setPuntoEntrega(data.punto_entrega?.texto ?? '');
          setEstado(data.estado ?? 'disponible');
        } else {
          Alert.alert('Error', 'No se pudo cargar el recurso.');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo conectar con el servidor.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [resourceId]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del recurso es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${BASE_URL}/api/resources/${resourceId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_recurso: nombre,
          descripcion: { ops: [{ insert: descripcion }] },
          condiciones_uso: { ops: [{ insert: condiciones }] },
          punto_entrega: { texto: puntoEntrega },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Listo', 'Recurso actualizado correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', data.error || 'No se pudo actualizar el recurso.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E293B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar recurso</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Nombre del recurso *</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Taladro eléctrico"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Descripción del recurso..."
            multiline
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Condiciones de uso</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={condiciones}
            onChangeText={setCondiciones}
            placeholder="Ej: Devolver limpio y en el mismo estado..."
            multiline
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Punto de entrega</Text>
          <TextInput
            style={styles.input}
            value={puntoEntrega}
            onChangeText={setPuntoEntrega}
            placeholder="Ej: Portería del edificio"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Estado</Text>
          <View style={styles.estadoRow}>
            {['disponible', 'en préstamo'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.estadoOption, estado === s && styles.estadoSelected]}
                onPress={() => setEstado(s)}
              >
                <Text style={[styles.estadoText, estado === s && styles.estadoTextSelected]}>
                  {s === 'disponible' ? 'Disponible' : 'En préstamo'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveButtonText}>Guardar cambios</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9EFE6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9EFE6',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  backButton: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scroll: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F9FAFB',
    color: '#1E293B',
    fontSize: 15,
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  estadoRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  estadoOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  estadoSelected: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  estadoText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  estadoTextSelected: { color: '#fff' },
  saveButton: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 20,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default EditResourceScreen;

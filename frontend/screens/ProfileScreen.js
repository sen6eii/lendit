import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../utils/apiConfig';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [userId, setUserId] = useState('');

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const uid = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('userToken');
        setUserId(uid);
        const response = await fetch(`${BASE_URL}/api/users/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setNombre(data.nombre ?? '');
          setTelefono(data.telefono ?? '');
          setEmail(data.email ?? '');
        }
      } catch {
        Alert.alert('Error', 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono }),
      });
      if (response.ok) {
        Alert.alert('Listo', 'Perfil actualizado correctamente');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Completá todos los campos de contraseña.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setChangingPassword(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${BASE_URL}/api/users/${userId}/password`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contraseña_actual: currentPassword, contraseña_nueva: newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Listo', 'Contraseña actualizada correctamente.');
        setShowPasswordSection(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        Alert.alert('Error', data.error || 'No se pudo cambiar la contraseña.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E293B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Información personal</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={email}
            editable={false}
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Tu teléfono"
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={[styles.button, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Guardar cambios</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPasswordSection(v => !v)}
          >
            <Ionicons
              name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
              size={18} color="#1E293B" style={{ marginRight: 8 }}
            />
            <Text style={styles.passwordToggleText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          {showPasswordSection && (
            <View style={styles.passwordSection}>
              <Text style={styles.label}>Contraseña actual</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrent}
                  placeholder="Contraseña actual"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowCurrent(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showCurrent ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowNew(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showNew ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirmar nueva contraseña</Text>
              <TextInput
                style={styles.input}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry={!showNew}
                placeholder="Repetí la nueva contraseña"
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                style={[styles.button, changingPassword && { opacity: 0.6 }]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Actualizar contraseña</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9EFE6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  backButton: { padding: 4, width: 40 },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 18, fontWeight: 'bold', color: '#1E293B',
  },
  scroll: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 20 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 16, marginTop: 4,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, padding: 12,
    backgroundColor: '#F9FAFB', color: '#1E293B', fontSize: 15,
  },
  inputDisabled: { backgroundColor: '#F3F4F6', color: '#9CA3AF' },
  button: {
    backgroundColor: '#1E293B', padding: 15,
    borderRadius: 12, alignItems: 'center', marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  passwordToggle: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 24, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  passwordToggleText: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  passwordSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, backgroundColor: '#fff',
    paddingHorizontal: 12, marginBottom: 4,
  },
  passwordInput: { flex: 1, height: 48, color: '#1E293B', fontSize: 15 },
  eyeBtn: { padding: 6 },
});

export default ProfileScreen;

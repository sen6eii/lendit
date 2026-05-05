import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useGroup } from '../src/context/GroupContext';

const CreateGroupStep3 = () => {
  const navigation = useNavigation();
  const { groupData, setGroupData } = useGroup();
  const [direccion, setDireccion] = useState(groupData.direccion || '');
  const [barrio, setBarrio] = useState(groupData.barrio || '');

  const handleContinue = () => {
    setGroupData({ ...groupData, direccion, barrio });
    navigation.navigate('Step4');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.stepIndicator}>2/4</Text>
      <Text style={styles.title}>Ubicación (opcional)</Text>
      <Text style={styles.description}>
        Esta información ayuda a conectar a los miembros cercanos.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Dirección o referencia</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Av. Principal 1234, Edificio Torre"
          value={direccion}
          onChangeText={setDireccion}
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Barrio o zona</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Pocitos, Palermo, Centro"
          value={barrio}
          onChangeText={setBarrio}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0', paddingHorizontal: 20 },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  stepIndicator: {
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 40,
    marginRight: 0,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  description: { fontSize: 14, color: '#6B7280', marginBottom: 30 },
  form: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#FFF',
    marginBottom: 20,
    fontSize: 15,
    color: '#1E293B',
  },
  continueButton: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  continueButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default CreateGroupStep3;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';

const Step3 = ({ navigation, resourceData, setResourceData }) => {
  const [maxDays, setMaxDays] = useState(resourceData.max_dias_reserva || 1);
  const [limitHours, setLimitHours] = useState(
    resourceData.disponibilidad.horas_especificas.desde ? true : false
  );
  const [fromHour, setFromHour] = useState(resourceData.disponibilidad.horas_especificas.desde || '');
  const [toHour, setToHour] = useState(resourceData.disponibilidad.horas_especificas.hasta || '');
  const [samePoint, setSamePoint] = useState(resourceData.devolucion_mismo_punto || true);

  const handleNext = () => {
    setResourceData({
      ...resourceData,
      max_dias_reserva: maxDays,
      disponibilidad: {
        ...resourceData.disponibilidad,
        horas_especificas: limitHours ? { desde: fromHour, hasta: toHour } : {},
      },
      devolucion_mismo_punto: samePoint,
    });
    navigation.navigate('Step4');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuraciones</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Días máximos de reserva</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setMaxDays(maxDays > 1 ? maxDays - 1 : 1)}
          >
            <Text style={styles.counterText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{maxDays}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setMaxDays(maxDays + 1)}
          >
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Limitar disponibilidad a horas específicas</Text>
        <Switch value={limitHours} onValueChange={(value) => setLimitHours(value)} />
      </View>

      {limitHours && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Desde (ej. 09:00 AM)"
            value={fromHour}
            onChangeText={setFromHour}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={styles.input}
            placeholder="Hasta (ej. 06:00 PM)"
            value={toHour}
            onChangeText={setToHour}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Devolución en el mismo punto</Text>
        <Switch value={samePoint} onValueChange={(value) => setSamePoint(value)} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1E293B' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#1E293B' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  counterText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  counterValue: { fontSize: 16, marginHorizontal: 10, color: '#1E293B' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#1E293B',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default Step3;

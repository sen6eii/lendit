import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
} from 'react-native';

const Step2 = ({ navigation, resourceData, setResourceData }) => {
  const [includeTutorial, setIncludeTutorial] = useState(resourceData.tutorial ? true : false);
  const [tutorialLink, setTutorialLink] = useState(resourceData.tutorial || '');
  const [conditions, setConditions] = useState(resourceData.condiciones_uso || '');
  const [requireAuth, setRequireAuth] = useState(resourceData.autenticacion_extra || false);

  const handleNext = () => {
    setResourceData({
      ...resourceData,
      tutorial: includeTutorial ? tutorialLink : '',
      condiciones_uso: conditions,
      autenticacion_extra: requireAuth,
    });
    navigation.navigate('Step3');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incluir Tutorial</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Incluir tutorial</Text>
        <Switch
          value={includeTutorial}
          onValueChange={(value) => setIncludeTutorial(value)}
        />
      </View>

      {includeTutorial && (
        <TextInput
          style={styles.input}
          placeholder="Enlace a video (YouTube, Vimeo, etc)"
          value={tutorialLink}
          onChangeText={setTutorialLink}
        />
      )}

      <Text style={styles.label}>Condiciones de uso</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ejemplo: Devolver en el mismo estado en que se prestó."
        value={conditions}
        onChangeText={setConditions}
        multiline
      />

      <View style={styles.row}>
        <Text style={styles.label}>Requiere autenticación extra</Text>
        <Switch
          value={requireAuth}
          onValueChange={(value) => setRequireAuth(value)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default Step2;

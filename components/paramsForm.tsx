import { useState, useContext, useMemo } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from './Themed';
import { ParamsContext } from './paramsContext';

/**
 * Formulario para actualizar la configuración.
 * Envía SOLO los campos que el usuario llenó al endpoint POST /data/configuraciones
 * para que se actualicen parcialmente.
 */
export function ParamsForm({ onSaved }: { onSaved?: () => void }) {
  const { params, updateParams } = useContext(ParamsContext);

  // Estado local como strings para facilitar inputs
  const [phMin, setPhMin] = useState<string>(params?.phMin ?? '');
  const [phMax, setPhMax] = useState<string>(params?.phMax ?? '');
  const [tempMin, setTempMin] = useState<string>(params?.tempMin ?? '');
  const [tempMax, setTempMax] = useState<string>(params?.tempMax ?? '');
  const [agitacion_recomendada, setAgitacionRecomendada] = useState<string>(params.agitacion_recomendada ?? '');
  const [intervalo, setIntervalo] = useState<string>(params?.intervalo ?? '');

  // Base URL configurable (Expo)
  const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://allge-care-apis.onrender.com';

  const bodyToSend = useMemo(() => {
    const payload: Record<string, any> = { id: 1 };
    if (phMin !== '') payload.ph_min = Number(phMin);
    if (phMax !== '') payload.ph_max = Number(phMax);
    if (tempMin !== '') payload.temperatura_min = Number(tempMin);
    if (tempMax !== '') payload.temperatura_max = Number(tempMax);
    if (agitacion_recomendada !== '') payload.agitacion_recomendada = Number(agitacion_recomendada);
    if (intervalo !== '') payload.intervalo = Number(intervalo);
    return payload;
  }, [phMin, phMax, tempMin, tempMax, agitacion_recomendada, intervalo]);

  const onSave = async () => {
    if (Object.keys(bodyToSend).length === 0) {
      Alert.alert('Nada que actualizar', 'Ingresa al menos un valor.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/data/configuraciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      });
      const json = await res.json();
      if (!res.ok) {
        console.log('Respuesta no OK:', json);
        Alert.alert('Error', json?.error || 'No se pudo actualizar.');
        return;
      }
      // Actualizar contexto con los valores confirmados del servidor (si vienen)
      const newParams = {
        phMin: json?.data?.ph_min?.toString?.() ?? phMin,
        phMax: json?.data?.ph_max?.toString?.() ?? phMax,
        tempMin: json?.data?.temperatura_min?.toString?.() ?? tempMin,
        tempMax: json?.data?.temperatura_max?.toString?.() ?? tempMax,
        agitacion_recomendada: json?.data?.agitacion_recomendada?.toString?.() ?? agitacion_recomendada,
        intervalo: json?.data?.intervalo?.toString?.() ?? intervalo,
      };
      updateParams(newParams);
      Alert.alert('Guardado', 'Configuración actualizada.');
      if (onSaved) onSaved();
    } catch (e: any) {
      console.error('Error POST /data/configuraciones', e);
      Alert.alert('Error de red', 'No se pudo conectar con la API.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>pH mínimo</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="ej. 6"
        value={phMin}
        onChangeText={setPhMin}
      />

      <Text style={styles.label}>pH máximo</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="ej. 9"
        value={phMax}
        onChangeText={setPhMax}
      />

      <Text style={styles.label}>Temperatura mínima</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="ej. 23"
        value={tempMin}
        onChangeText={setTempMin}
      />

      <Text style={styles.label}>Temperatura máxima</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="ej. 28"
        value={tempMax}
        onChangeText={setTempMax}
      />
      <Text style={styles.label}>Tiempo de agitacion</Text>
      <TextInput
        style={styles.input}
        keyboardType='numeric'
        placeholder='ej. 60'
        value={agitacion_recomendada}
        onChangeText={setAgitacionRecomendada}
      />
      <Text style={styles.label}>Intervalo (min)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="ej. 15"
        value={intervalo}
        onChangeText={setIntervalo}
      />

      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Guardar configuración</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginHorizontal: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    marginHorizontal: 8,
    marginVertical: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


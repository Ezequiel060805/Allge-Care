// two.tsx
import { useEffect, useState, useRef } from 'react';
import { Platform, StyleSheet, ScrollView, RefreshControl, View as RNView } from 'react-native';
import { Text as Text2 } from '@/components/Themed';
import { Max_Min_Card } from '@/components/max_Min_Card';
import MedicionesChart from '@/components/MedicionesChart';

// Base URL por plataforma
const API_BASE = Platform.select({
  android: 'https://allge-care-apis.onrender.com',
  ios: 'https://allge-care-apis.onrender.com'
});

// --- Tipos alineados con index.js ---
interface MaxLastDay {
  maxPh: number;
  maxTemp: number;
}

interface MinLastDay {
  minPh: number;
  minTemp: number;
}

interface DataPoint {
  ph: number;
  temperatura: number;
  hora: string; // viene así desde la API
}

// Componente principal
export default function TabTwoScreen() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  // Refresh control state
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const coolingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [maxLastDay, setMaxLastDay] = useState<MaxLastDay | null>(null);
  const [minLastDay, setMinLastDay] = useState<MinLastDay | null>(null);
  // Animaciones para la card de la gráfica
  //Rutas de las imagenes
  const iconPh = require('../../assets/images/iconosComponentes/2.png');
  const iconTemp = require('../../assets/images/iconosComponentes/3.png');
  const onRefresh = () => {
    if (coolingRef.current) return;
    setRefreshing(true);
    setReloadKey((k) => k + 1);
  };
  // Fetch de la API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await fetch(`${API_BASE}/data/mediciones`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json() as {
          latest: DataPoint | null;
          maxLastDay: MaxLastDay | null;
          minLastDay: MinLastDay | null;
        };
        // ✅ Normalize server shape defensively (handles backend typo: minLastDay.maxTemp -> minTemp)
        const normalizedMaxLastDay = json.maxLastDay
          ? {
            maxPh: Number((json.maxLastDay as any).maxPh),
            maxTemp: Number((json.maxLastDay as any).maxTemp)
          }
          : null;

        const normalizedMinLastDay = json.minLastDay
          ? {
            minPh: Number((json.minLastDay as any).minPh),
            // si alguna vez vino con la clave equivocada, caer a maxTemp (o a otra clave esperada)
            minTemp: Number(
              (json.minLastDay as any).minTemp ??
              (json.minLastDay as any).maxTemp ?? // ← fallback defensivo
              (json.minLastDay as any).temperatura_min // ← por si el backend usa snake_case
            )
          }
          : null;
        if (!isMounted) return;
        setMaxLastDay(normalizedMaxLastDay);
        setMinLastDay(normalizedMinLastDay);
      } catch (err: any) {
        console.error('Error al cargar mediciones:', err);
        if (isMounted) setErrorMsg(err?.message ?? 'Error desconocido');
      } finally {
        if (isMounted) setLoading(false);
        setRefreshing(false);
        if (coolingRef.current) clearTimeout(coolingRef.current);
        coolingRef.current = setTimeout(() => { coolingRef.current = null; }, 1000);
      }
    })();
    return () => {
      isMounted = false;
      if (coolingRef.current) clearTimeout(coolingRef.current);
    };
  }, [reloadKey]);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>

      <RNView style={styles.containerTitle}>
        <Text2 style={styles.title}>Registros</Text2>
      </RNView>

      {/* Tarjetas de máximos/mínimos */}
      <RNView style={styles.metricsRow}>
        <Max_Min_Card
          title="pH"
          min={minLastDay?.minPh !== undefined ? minLastDay.minPh.toFixed(2) : '-'}
          max={maxLastDay?.maxPh !== undefined ? maxLastDay.maxPh.toFixed(2) : '-'}
          image={iconPh}
          bgColor="#f6d9fe"
        />
        <Max_Min_Card
          title="Temperatura"
          min={minLastDay?.minTemp !== undefined ? `${minLastDay.minTemp.toFixed(2)} °C` : '-'}
          max={maxLastDay?.maxTemp !== undefined ? `${maxLastDay.maxTemp.toFixed(2)} °C` : '-'}
          image={iconTemp}
          bgColor="#fdf9c4"
        />
      </RNView>
      <MedicionesChart
        endpoint='https://allge-care-apis.onrender.com/data/mediciones'
        initialRange='day'
        initialMetric='temp'
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerTitle: {
    marginBottom: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});


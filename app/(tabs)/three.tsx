import { useContext, useState, useEffect, useRef } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { ParamsProvider, ParamsContext } from '@/components/paramsContext';
import { Max_Min_Card } from '@/components/max_Min_Card';
import { ValueCard } from '@/components/valueCard';
import { ParamsForm } from '@/components/paramsForm';

interface Configuracion {
  ph_min: number;
  ph_max: number;
  temperatura_min: number;
  temperatura_max: number;
  agitacion: boolean;
  intervalo: number;
}

export default function TabThreeScreen() {
  // Consumir valores del contexto (opcional, también se puede pasar directamente via useContext en hijos)
  const { params } = useContext(ParamsContext);

  const iconPh = require('../../assets/images/iconosComponentes/2.png');
  const iconTemp = require('../../assets/images/iconosComponentes/3.png');
  const iconTime = require('../../assets/images/iconosComponentes/5.png');
  //loading control
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  //Refreshing control
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const coolingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onRefresh = () => {
    if (coolingRef.current) return;
    setRefreshing(true);
    setReloadKey((k) => k + 1);
  };
  // API CONTROL
  async function fetchConfig() {
    try {
      const res = await fetch('https://allge-care-apis.onrender.com/data/configuraciones');
      const json: Configuracion = await res.json();
      setConfig(json);
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      if (coolingRef.current) clearTimeout(coolingRef.current);
      coolingRef.current = setTimeout(() => { coolingRef.current = null; }, 1000);
    }
  }
  useEffect(() => {
    fetchConfig();
    return () => { if (coolingRef.current) clearTimeout(coolingRef.current); };
  }, [reloadKey]);
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando configuraciones…</Text>
      </View>
    );
  }

  if (!config) {
    return (
      <View style={styles.center}>
        <Text>No hay configuraciones disponibles</Text>
      </View>
    );
  }


  return (
    <ScrollView
      style={styles.containerScroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ParamsProvider>
        <View style={styles.container}>
          <View style={styles.containerTitle}>
            <Text style={styles.title}>Configuracion</Text>
          </View>
          <View style={styles.grid}>
            <Max_Min_Card
              title="pH"
              min={`${config.ph_min.toFixed(2)}`}
              max={`${config.ph_max.toFixed(2)}`}
              image={iconPh}
              bgColor="#f9eaae"   // verde pastel claro 
            />
            <Max_Min_Card
              title="Temperatura"
              min={`${config.temperatura_min.toFixed(2)} °C`}
              max={`${config.temperatura_max.toFixed(2)} °C`}
              image={iconTemp}
              bgColor="#ffc8cc"   // naranja pastel claro 
            />
          </View>
          <ValueCard
            title="Tiempo de agitacion"
            value={`${config.agitacion}`}
            image={iconTime}
            bgColor="#efc6fc"   // azul pastel claro 
          />
          <ValueCard
            title="Intervalo de agitacion"
            value={`${config.intervalo}`}
            image={iconTime}
            bgColor="#efc6fc"
          />
          <View style={styles.containerTitle}>
            <Text style={styles.title}>Actualizar</Text>
          </View>
          <ParamsForm />
        </View>
      </ParamsProvider>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerScroll: {
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    marginHorizontal: 4,
    paddingTop: 16
  },
  containerTitle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
});


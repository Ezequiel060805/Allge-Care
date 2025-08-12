import { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import UserInfoCard from '../../components/userDataCard';
import DataCard from '../../components/dataCard';
import { Text } from '../../components/Themed';
import AlertNative from '@/components/Alert2';
import * as SecureStore from 'expo-secure-store';

function formatearFecha(fechaIso?: string | null) {
  if (!fechaIso) return '—';
  // Espera formato ISO 'YYYY-MM-DDTHH:mm:ssZ'
  return fechaIso.slice(0, 10);
}

function statusLuz(luz: string): string {
  if (luz === '1') {
    return 'Suficiente luz';
  } else if (luz === '0') {
    return 'Insuficiente luz';
  } else {
    return 'Estado Desconocido';
  }
}

interface Usuario {
  nombre: string;
  correo: string;
  fecha_creacion: string;
  rol: string;
}

interface Medicion {
  ph: string;
  temperatura: string;
  luz: string;
  hora: string;
}

export default function IndexScreen() {
  const iconPh = require('../../assets/images/iconosComponentes/2.png');
  const iconTemp = require('../../assets/images/iconosComponentes/3.png');
  const iconLuz = require('../../assets/images/iconosComponentes/4.png');
  const iconHora = require('../../assets/images/iconosComponentes/5.png');
  const [infoUsuario, setInfoUsuario] = useState<Usuario | null>(null);
  const [ultimaMedicion, setUltimaMedicion] = useState<{
    ph: string;
    temperatura: string;
    luz: string;
    hora: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);


  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const coolingRef = useRef(false);

  const onRefresh = () => {
    if (coolingRef.current) return;
    setRefreshing(true);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // 1) Obtener datos de usuario filtrando por correo
        const email = await SecureStore.getItemAsync('email_persistent');

        if (!email) {
          // Manejo simple: no hay sesión/email guardado
          setInfoUsuario(null);
          setUltimaMedicion(null);
          return;
        }
        const usuarioRes = await fetch(
          `https://allge-care-apis.onrender.com/data/usuario?email=${encodeURIComponent(email)}`
        );
        const usuarios: Usuario[] = await usuarioRes.json();
        if (usuarios.length > 0) {
          setInfoUsuario(usuarios[0]);
        }
        // 2) Obtener última medición
        const medicionRes = await fetch(`https://allge-care-apis.onrender.com/data/mediciones`);
        const mediciones = await medicionRes.json();
        const latest: Medicion | null = mediciones.latest || null;
        if (latest) {
          setUltimaMedicion({
            ph: latest.ph,
            temperatura: `${latest.temperatura} °C`,
            luz: `${latest.luz}`,
            hora: `${latest.hora}`,
          });
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData().finally(() => setRefreshing(false));
  }, [reloadKey]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando datos…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {infoUsuario ? (
        <UserInfoCard
          name={infoUsuario.nombre}
          email={infoUsuario.correo}
          createdAt={formatearFecha(
            (infoUsuario as any).fecha_registro ??
            (infoUsuario as any).fecha_creacion
          )}
          role={infoUsuario.rol}
        />
      ) : (
        <Text>Ningun usuario encontrado</Text>
      )}

      <View style={styles.containerTitle}>
        <Text style={styles.title}>Parametros</Text>
      </View>
      {ultimaMedicion ? (
        <View style={styles.grid}>
          <DataCard image={iconPh} title="pH" value={ultimaMedicion.ph} />
          <DataCard image={iconTemp} title="Temperatura" value={ultimaMedicion.temperatura} />
          <DataCard image={iconLuz} title="Luz" value={statusLuz(ultimaMedicion.luz)} />
          <DataCard image={iconHora} title="Hora" value={ultimaMedicion.hora} />
        </View>
      ) : (
        <Text>No hay mediciones disponibles</Text>
      )}
      <AlertNative
        endpoint='https://allge-care-apis.onrender.com/data/alertas'
        autoRefreshMs={15000}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  containerTitle: {
    alignItems: 'center',
  },
  title: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 16
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

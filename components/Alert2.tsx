import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ViewStyle,
} from 'react-native';

/**
 * AlertNative
 * ---------------------------------------------
 * Componente reutilizable de React Native que consume el endpoint
 * GET /data/alertas y muestra la última alerta en una tarjeta con
 * tonos pastel.

 * Uso básico:
 * <AlertNative endpoint="http://TU_API/data/alertas" />
 *
 * - Puedes pasar un `endpoint` absoluto o relativo. Si estás en Expo y
 *   tu API corre en la misma red, usa la IP de tu máquina.
 * - `theme` permite cambiar los tonos pastel.
 * - `autoRefreshMs` refresca automáticamente cada cierto tiempo (opcional).
 */

function formatearFecha(fechaIso?: string | null) {
  if (!fechaIso) return '—';
  // Espera formato ISO 'YYYY-MM-DDTHH:mm:ssZ'
  return fechaIso.slice(0, 10);
}

export type AlertasResponse = {
  fecha_alerta: string | null;
  hora_alerta: string | null;
  comentarios: string | null;
  ph_valor: number | null;
  luz_detectada: number | boolean | null;
  temperatura: number | null;
} | null;

export type PastelTheme = 'peach' | 'mint' | 'lilac' | 'sky' | 'sand';

export interface AlertNativeProps {
  endpoint?: string; // por defecto '/data/alertas'
  theme?: PastelTheme;
  autoRefreshMs?: number; // e.g. 15000 para refrescar cada 15s
  style?: ViewStyle;
  onPress?: () => void;
}

const THEME_COLORS: Record<PastelTheme, { bg: string; border: string; text: string; pill: string }>
  = {
  peach: { bg: '#FFE9E3', border: '#FFD6CC', text: '#5B3A37', pill: '#FFDAD1' },
  mint: { bg: '#E8FFF3', border: '#D1F7E6', text: '#2F4F45', pill: '#DDF7EB' },
  lilac: { bg: '#F2E9FF', border: '#E1D4FF', text: '#3E3456', pill: '#E9DEFF' },
  sky: { bg: '#EAF6FF', border: '#D6EBFF', text: '#213A4C', pill: '#DFF0FF' },
  sand: { bg: '#FFF6E5', border: '#FFE9C7', text: '#4F3B26', pill: '#FFEDD1' },
};

function formatLabel(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
}

export default function AlertNative({
  endpoint = '/data/alertas',
  theme = 'peach',
  autoRefreshMs,
  style,
  onPress,
}: AlertNativeProps) {
  const [data, setData] = useState<AlertasResponse>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const colors = THEME_COLORS[theme];

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const fetchData = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AlertasResponse = await res.json();
      setData(json);
    } catch (err: any) {
      if (err?.name !== 'AbortError') setError(err?.message ?? 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(fetchData, autoRefreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, autoRefreshMs]);

  const content = (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Alerta reciente</Text>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Cargando…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.error}>No se pudo cargar: {error}</Text>
          <TouchableOpacity style={styles.retry} onPress={fetchData}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <View style={styles.body}>
          <Row label="Fecha" value={formatearFecha(data?.fecha_alerta)} />
          <Row label="Hora" value={data?.hora_alerta} />
          <Row label="Comentarios" value={data?.comentarios} multiline />

          <View style={styles.metrics}>
            <MetricChip label="pH" value={data?.ph_valor} />
            <MetricChip label="Luz" value={data?.luz_detectada} />
            <MetricChip label="Temp (°C)" value={data?.temperatura} />
          </View>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingVertical: 8 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
    >
      {content}
    </ScrollView>
  );
}

function Row({ label, value, multiline }: { label: string; value: unknown; multiline?: boolean }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, multiline && rowStyles.multiline]} numberOfLines={multiline ? 3 : 1}>
        {formatLabel(value)}
      </Text>
    </View>
  );
}

function MetricChip({ label, value }: { label: string; value: unknown }) {
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.chipLabel}>{label}</Text>
      <Text style={chipStyles.chipValue}>{formatLabel(value)}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  label: {
    width: 110,
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  value: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  multiline: {
    lineHeight: 20,
  },
});

const chipStyles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFFAA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00000010',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  chipValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
});

function makeStyles(colors: { bg: string; border: string; text: string; pill: string }) {
  return StyleSheet.create({
    card: {
      marginBottom: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    pillText: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.8,
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      gap: 8,
    },
    muted: {
      fontSize: 13,
      color: '#6B7280',
    },
    error: {
      fontSize: 14,
      color: '#B91C1C',
      textAlign: 'center',
      marginBottom: 8,
    },
    retry: {
      alignSelf: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.pill,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    retryText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    body: {
      gap: 6,
      marginTop: 2,
    },
    metrics: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 6,
    },
  });
}


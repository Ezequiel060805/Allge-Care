// MedicionesChart.tsx (Expo/React Native + TypeScript)

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  useColorScheme,
  UIManager,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Colors from '@/constants/Colors';

// --------- Tipos ----------
type RangeKey = 'day' | 'week' | 'month';
type MetricKey = 'temp' | 'ph' | 'both';

type Measurement = {
  ph: number | string | null | undefined;
  temperatura: number | string | null | undefined;
  hora?: string | null;
  dia_registro?: string | null;
};

type CleanMeasurement = {
  ph: number;
  temperatura: number;
  hora: string;
  dia_registro: string;
};

type ApiResponse = {
  lastDayData?: Measurement[];
  lastWeekData?: Measurement[];
  lastMonthData?: Measurement[];
};

type SegmentedOption<K extends string> = { key: K; label: string };

type MedicionesChartProps = {
  endpoint?: string;
  initialRange?: RangeKey;
  initialMetric?: MetricKey;
  theme?: 'system' | 'light' | 'dark';
};

// --------- Paletas claro/oscuro ----------
const palette = {
  light: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    grid: 'rgba(148, 163, 184, 0.25)',
    ph: '#93c5fd',
    temp: '#fca5a5',
    label: '#475569',
    title: '#334155',
    segBg: '#f1f5f9',
    segActive: '#e9d5ff',
    errorBg: '#fee2e2',
    errorTitle: '#991b1b',
    errorText: '#7f1d1d',
    empty: '#64748b',
  },
  dark: {
    bg: '#0B1220',
    card: '#111827',
    grid: 'rgba(148, 163, 184, 0.22)',
    ph: '#60a5fa',
    temp: '#f87171',
    label: '#cbd5e1',
    title: '#e2e8f0',
    segBg: '#1f2937',
    segActive: '#4c1d95',
    errorBg: '#7f1d1d',
    errorTitle: '#fecaca',
    errorText: '#fecaca',
    empty: '#94a3b8',
  },
} as const;

const screenWidth = Dimensions.get('window').width;

// --------- Utilidades ----------

// ¿Existe el módulo nativo de react-native-svg?
function hasRNSVG(): boolean {
  try {
    const ui: any = UIManager as any;
    if (typeof ui?.getViewManagerConfig === 'function') {
      return !!ui.getViewManagerConfig('RNSVGPath');
    }
    return !!ui?.RNSVGPath;
  } catch {
    return false;
  }
}

// Downsample simple por buckets (promedio) y preserva hora/día del primer elemento del bucket
function downsampleAligned(points: CleanMeasurement[], target = 420): CleanMeasurement[] {
  if (!points || points.length <= target) return points || [];
  const n = points.length;
  const bucketSize = Math.ceil(n / target);
  const result: CleanMeasurement[] = [];
  for (let i = 0; i < n; i += bucketSize) {
    const bucket = points.slice(i, i + bucketSize);
    const avgPh = bucket.reduce((s, p) => s + (Number(p?.ph) || 0), 0) / bucket.length;
    const avgTemp =
      bucket.reduce((s, p) => s + (Number(p?.temperatura) || 0), 0) / bucket.length;
    const first = bucket[0] || ({} as CleanMeasurement);
    result.push({
      ph: Number.isFinite(avgPh) ? avgPh : 0,
      temperatura: Number.isFinite(avgTemp) ? avgTemp : 0,
      hora: first.hora ?? '',
      dia_registro: first.dia_registro ?? '',
    });
  }
  return result;
}

// Sanitiza una serie asegurando números finitos
function sanitizeSeries(points: Measurement[] | undefined | null): CleanMeasurement[] {
  if (!Array.isArray(points)) return [];
  return points.map((p) => {
    const phNum = Number(p?.ph);
    const tempNum = Number(p?.temperatura);
    return {
      ph: Number.isFinite(phNum) ? phNum : 0,
      temperatura: Number.isFinite(tempNum) ? tempNum : 0,
      hora: String(p?.hora ?? ''),
      dia_registro: String(p?.dia_registro ?? ''),
    };
  });
}

// Etiquetas adaptadas a rango
function shortDate(d?: string): string {
  const s = String(d || '');
  if (s.includes('-')) {
    const parts = s.split('-');
    if (parts.length >= 3) {
      const [y, m, day] = parts;
      return `${day}/${m}`;
    }
  }
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[2]}/${parts[1]}`;
      return `${parts[0]}/${parts[1]}`;
    }
  }
  return s;
}

// Inicial del día (ES): D L M X J V S a partir de dia_registro
function weekdayInitialFromDateParts(ymd?: string): string {
  const s = String(ymd || '');
  let y = 0,
    m = 0,
    d = 0;
  if (s.includes('-')) {
    const a = s.split('-');
    if (a.length >= 3) {
      y = +a[0];
      m = +a[1];
      d = +a[2];
    }
  } else if (s.includes('/')) {
    const b = s.split('/');
    if (b.length === 3) {
      if (b[0].length === 4) {
        y = +b[0];
        m = +b[1];
        d = +b[2];
      } else {
        y = +b[2];
        m = +b[1];
        d = +b[0];
      }
    }
  }
  const dt = new Date(y || 1970, (m || 1) - 1, d || 1);
  if (isNaN(dt.getTime())) return '';
  const letters = ['D', 'L', 'M', 'X', 'J', 'V', 'S'] as const;
  return letters[dt.getDay()];
}

function buildXAxisLabels(
  points: CleanMeasurement[],
  maxLabels: number = 8,
  range: RangeKey = 'day'
): string[] {
  if (!points || points.length === 0) return [];
  const n = points.length;
  const step = Math.max(1, Math.floor(n / maxLabels));
  const labels = new Array<string>(n).fill('');
  for (let i = 0; i < n; i += step) {
    const p = points[i] || ({} as CleanMeasurement);
    const hhmm = String(p.hora || '').slice(0, 5);
    labels[i] =
      range === 'week'
        ? p.dia_registro
          ? weekdayInitialFromDateParts(p.dia_registro)
          : ''
        : range === 'day'
          ? hhmm
          : p.dia_registro
            ? shortDate(p.dia_registro)
            : hhmm;
  }
  // fuerza última etiqueta
  const plast = points[n - 1] || ({} as CleanMeasurement);
  labels[n - 1] =
    range === 'week'
      ? plast.dia_registro
        ? weekdayInitialFromDateParts(plast.dia_registro)
        : ''
      : range === 'day'
        ? String(plast.hora || '').slice(0, 5)
        : plast.dia_registro
          ? shortDate(plast.dia_registro)
          : String(plast.hora || '').slice(0, 5);
  return labels;
}

// Calcula: width total del gráfico y spacing entre puntos
function computeChartLayout(
  n: number,
  {
    baseWidth = Math.max(screenWidth - 24, 280),
    pad = 24,
    initialSpacing = 8,
    minSpacing = 6,
  }: { baseWidth?: number; pad?: number; initialSpacing?: number; minSpacing?: number }
): { width: number; spacing: number } {
  if (n <= 1)
    return {
      width: baseWidth,
      spacing: Math.max(minSpacing, baseWidth - pad - initialSpacing),
    };
  const innerBase = baseWidth - pad;
  const spacingToFill = Math.max(minSpacing, Math.floor((innerBase - initialSpacing) / (n - 1)));
  if (spacingToFill >= minSpacing) {
    return { width: baseWidth, spacing: spacingToFill };
  }
  const requiredInner = initialSpacing + (n - 1) * minSpacing;
  const requiredWidth = requiredInner + pad;
  return { width: Math.max(baseWidth, requiredWidth), spacing: minSpacing };
}

// --------- Datos (fetch) ----------
function useMediciones(endpoint: string) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(endpoint, { signal: controller.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = (await res.json()) as ApiResponse;
        if (mounted) setData(json);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Error al cargar');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [endpoint]);

  return { data, loading, error };
}

const URL_API = 'https://allge-care-apis.onrender.com/data/mediciones';
// const URL_API='http://10.0.2.2:3000/data/mediciones';

// --------- Componente principal ----------
export default function MedicionesChart({
  endpoint = URL_API,
  initialRange = 'day',
  initialMetric = 'temp',
  theme = 'system',
}: MedicionesChartProps) {
  const { data, loading, error } = useMediciones(endpoint);
  const [range, setRange] = useState<RangeKey>(initialRange);
  const [metric, setMetric] = useState<MetricKey>(initialMetric);

  const osScheme = useColorScheme();
  const resolvedScheme: 'light' | 'dark' =
    theme === 'system' ? (osScheme === 'dark' ? 'dark' : 'light') : theme;
  const colors = palette[resolvedScheme];

  // RANGOS DISPONIBLES SEGÚN BACKEND
  const availableRanges = useMemo<SegmentedOption<RangeKey>[]>(() => {
    const opts: SegmentedOption<RangeKey>[] = [{ key: 'day', label: 'Día' }];
    if (data?.lastWeekData?.length) opts.push({ key: 'week', label: 'Semana' });
    if (data?.lastMonthData?.length) opts.push({ key: 'month', label: 'Mes' });
    return opts;
  }, [data]);

  // Si el rango actual no está disponible, cambia al primero disponible
  useEffect(() => {
    const keys = availableRanges.map((o) => o.key);
    if (!keys.includes(range) && keys.length > 0) {
      setRange(keys[0]);
    }
  }, [availableRanges, range]);

  // Series crudas según rango actual
  const rawSeries = useMemo<Measurement[]>(() => {
    if (!data) return [];
    if (range === 'day') return data.lastDayData || [];
    if (range === 'week') return data.lastWeekData || [];
    return data.lastMonthData || [];
  }, [data, range]);

  // Sanitiza + downsample
  const series = useMemo<CleanMeasurement[]>(
    () => downsampleAligned(sanitizeSeries(rawSeries), 420),
    [rawSeries]
  );

  // Datos para chart
  type ChartPoint = { value: number };
  const phData = useMemo<ChartPoint[]>(
    () => series.map((p) => ({ value: Number(p.ph) || 0 })),
    [series]
  );
  const tempData = useMemo<ChartPoint[]>(
    () => series.map((p) => ({ value: Number(p.temperatura) || 0 })),
    [series]
  );

  // Qué dataset se muestra como principal (data) y cuál como secundario (data2)
  const showPH = metric === 'ph' || metric === 'both';
  const showTemp = metric === 'temp' || metric === 'both';
  const mainData: ChartPoint[] = showTemp ? tempData : phData;
  const secondaryData: ChartPoint[] | undefined = showPH && showTemp ? phData : undefined;

  // Etiquetas alineadas al dataset principal
  const labels = useMemo<string[]>(() => {
    const lbls = buildXAxisLabels(series, 8, range);
    if (lbls.length !== mainData.length) {
      if (lbls.length > mainData.length) return lbls.slice(0, mainData.length);
      return lbls.concat(new Array(mainData.length - lbls.length).fill(''));
    }
    return lbls;
  }, [series, range, mainData.length]);

  // Layout del gráfico
  const { width, spacing } = useMemo(
    () =>
      computeChartLayout(series.length, {
        baseWidth: Math.max(screenWidth - 24, 280),
        pad: 24,
        initialSpacing: 8,
        minSpacing: 6,
      }),
    [series.length]
  );

  const hideDots = series.length > 150;
  const styles = useMemo(() => createStyles(colors), [colors]);

  // --------- Render ----------
  // Chequeo de dependencia nativa RNSVG para evitar crash en release
  const svgReady = hasRNSVG();

  return (
    <View style={[styles.container]}>
      {/* Controles */}
      <View style={styles.row}>
        <Segmented<RangeKey>
          colors={colors}
          value={range}
          onChange={setRange}
          options={availableRanges}
        />
      </View>

      <View style={[styles.row, { marginTop: 8 }]}>
        <Segmented<MetricKey>
          colors={colors}
          value={metric}
          onChange={setMetric}
          options={[
            { key: 'temp', label: 'Temperatura' },
            { key: 'ph', label: 'pH' },
            // { key: 'both', label: 'Ambas' },
          ]}
        />
      </View>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.label} />
          <Text style={[styles.loadingText, { color: colors.empty }]}>Cargando…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={[styles.errorBox, { backgroundColor: colors.errorBg }]}>
          <Text style={[styles.errorTitle, { color: colors.errorTitle }]}>No se pudo cargar</Text>
          <Text style={[styles.errorText, { color: colors.errorText }]}>{String(error)}</Text>
        </View>
      )}

      {!loading && !error && !svgReady && (
        <View style={[styles.errorBox, { backgroundColor: colors.errorBg }]}>
          <Text style={[styles.errorTitle, { color: colors.errorTitle }]}>
            Falta dependencia nativa (SVG)
          </Text>
          <Text style={[styles.errorText, { color: colors.errorText }]}>
            No se encontró el módulo nativo de <Text style={{ fontWeight: '600' }}>react-native-svg</Text>.
            Reinstálalo/actualízalo y recompila el APK/Bundle.
          </Text>
        </View>
      )}

      {!loading && !error && svgReady && series.length === 0 && (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.empty }]}>Sin datos para mostrar</Text>
        </View>
      )}

      {!loading && !error && svgReady && series.length > 0 && (
        <ScrollView
          style={{ alignSelf: 'stretch' }}
          contentContainerStyle={{ paddingBottom: 8 }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <View style={[styles.chartCard, { width, backgroundColor: colors.card }]}>
            <LineChart
              // Datos
              data={mainData as any}
              data2={secondaryData as any}
              // Dimensiones
              height={260}
              width={width - 24}
              spacing={spacing}
              initialSpacing={8}
              // Estilo
              thickness={2}
              color1={colors.temp}
              color2={colors.ph}
              hideDataPoints={hideDots}
              showVerticalLines
              verticalLinesColor={colors.grid}
              yAxisColor={colors.grid}
              xAxisColor={colors.grid}
              // Ejes
              xAxisLabelTexts={labels}
              xAxisLabelTextStyle={{ color: colors.label, fontSize: 10 }}
              yAxisTextStyle={{ color: colors.label, fontSize: 10 }}
              rulesColor={colors.grid}
              noOfSections={5}
              yAxisLabelSuffix={metric === 'temp' ? '°C' : ''}
              // Animación y fondo
              isAnimated={false}
              backgroundColor={colors.card}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// --------- UI Aux ----------
type SegmentedProps<K extends string> = {
  value: K;
  onChange: (k: K) => void;
  options: SegmentedOption<K>[];
  colors: (typeof palette)['light'];
};

function Segmented<K extends string>({ value, onChange, options, colors }: SegmentedProps<K>) {
  return (
    <View style={[segmentedStyles.container, { backgroundColor: colors.segBg }]}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[segmentedStyles.btn, active && { backgroundColor: colors.segActive }]}
          >
            <Text
              style={[
                segmentedStyles.label,
                { color: active ? colors.title : colors.label, fontWeight: active ? '600' : '400' },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const segmentedStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
  },
});

function createStyles(colors: (typeof palette)['light']) {
  return StyleSheet.create({
    container: {
      padding: 12,
      gap: 8,
      backgroundColor: colors.bg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loading: {
      height: 220,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    loadingText: {},
    empty: {
      height: 220,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {},
    errorBox: {
      borderRadius: 12,
      padding: 12,
    },
    errorTitle: { fontWeight: '600', marginBottom: 4 },
    errorText: {},
    chartCard: {
      marginTop: 8,
      borderRadius: 16,
      padding: 12,
    },
  });
}

// USO:
// import MedicionesChart from '@/components/MedicionesChart';
// <MedicionesChart
//   endpoint="http://TU_BACKEND/data/mediciones"
//   initialRange="day"
//   initialMetric="temp"
//   theme="system"
// />


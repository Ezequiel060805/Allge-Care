import React, { createContext, useState } from 'react';

interface ParamsData {
  phMin: string;
  phMax: string;
  tempMin: string;
  tempMax: string;
  agitacion_recomendada: string;
  intervalo: string;
}
interface ParamsContextType {
  params: ParamsData;
  updateParams: (newParams: ParamsData) => void;
}
export const ParamsContext = createContext<ParamsContextType>({} as ParamsContextType);
export const ParamsData = createContext<ParamsContextType>({} as ParamsContextType);
// Proveedor de contexto
export function ParamsProvider({ children }: { children: React.ReactNode }) {
  // Estado centralizado de parámetros (valores iniciales falsos de ejemplo)
  const [params, setParams] = useState<ParamsData>({
    phMin: '',
    phMax: '',
    tempMin: '',
    tempMax: '',
    agitacion_recomendada: '',
    intervalo: ''
  });
  // Función para actualizar todos los parámetros a la vez
  const updateParams = (newParams: ParamsData) => {
    setParams(newParams);
  };
  return (
    <ParamsContext.Provider value={{ params, updateParams }}>
      {children}
    </ParamsContext.Provider>
  );
}


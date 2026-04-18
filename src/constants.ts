export const DQ_DIMENSIONS = [
  { id: 'completeness', label: 'Completitud', description: 'Porcentaje de registros con valores no nulos.' },
  { id: 'consistency', label: 'Consistencia', description: 'Uniformidad de los datos entre diferentes tablas o formatos.' },
  { id: 'uniqueness', label: 'Unicidad', description: 'Identificación de registros duplicados.' },
  { id: 'validity', label: 'Validez', description: 'Cumplimiento con formatos y tipos de datos esperados.' },
  { id: 'accuracy', label: 'Exactitud', description: 'Grado de veracidad de los datos frente a una fuente de referencia.' },
  { id: 'timeliness', label: 'Actualidad', description: 'Disponibilidad de los datos en el tiempo requerido.' }
];

export const FRAMEWORKS = [
  { id: 'DAMA-DMBOK', name: 'DAMA-DMBOK (Data Management Body of Knowledge)' },
  { id: 'ISO 8000', name: 'ISO 8000 (Data Quality)' },
  { id: 'ISO 25012', name: 'ISO 25012 (Data Quality Model)' },
  { id: 'DCAM', name: 'DCAM (Data Management Capability Assessment Model)' }
];

export const SAAS_COLORS = {
  primary: '#0F172A',
  secondary: '#334155',
  accent: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#F8FAFC'
};

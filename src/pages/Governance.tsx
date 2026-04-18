import { 
  Shield, 
  Book, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  Award,
  CircleHelp
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const FRAMEWORK_STATS = [
  { subject: 'Gobernanza', A: 85, fullMark: 100 },
  { subject: 'Seguridad', A: 92, fullMark: 100 },
  { subject: 'Calidad', A: 78, fullMark: 100 },
  { subject: 'Metadata', A: 60, fullMark: 100 },
  { subject: 'Ética', A: 95, fullMark: 100 },
  { subject: 'Arquitectura', A: 70, fullMark: 100 },
];

const StandardCard = ({ title, status, percentage }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
        <Book size={20} />
      </div>
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
        status === 'compliant' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {status === 'compliant' ? 'CUMPLIDO' : 'PARCIAL'}
      </span>
    </div>
    <div>
      <h4 className="font-bold text-slate-900">{title}</h4>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${status === 'compliant' ? 'bg-green-500' : 'bg-amber-500'}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-700">{percentage}%</span>
      </div>
    </div>
  </div>
);

export default function Governance() {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gobierno de Datos</h1>
          <p className="text-slate-500 mt-1">Nivel de madurez y cumplimiento con estándares internacionales.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
          <Target size={20} />
          Autoevaluación DCAM
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Maturity Chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-slate-900 mb-2">Modelo de Madurez</h3>
          <p className="text-xs text-slate-500 text-center mb-6">Basado en framework DAMA-DMBOK v2</p>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={FRAMEWORK_STATS}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" fontSize={10} tick={{ fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Maturity"
                  dataKey="A"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 w-full p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Award size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">Nivel de Madurez Actual: 3.2</p>
              <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">Definido y Optimizable</p>
            </div>
          </div>
        </div>

        {/* Standards Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StandardCard title="DAMA-DMBOK Consistency" status="compliant" percentage={92} />
            <StandardCard title="ISO 8000 Part 110: Master Data" status="partial" percentage={65} />
            <StandardCard title="ISO 25012 Data Quality Model" status="compliant" percentage={88} />
            <StandardCard title="DCAM Data Management" status="partial" percentage={42} />
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center gap-6">
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold italic font-serif">Recomendación Sugerida (IA)</h3>
              <p className="text-sm text-slate-300">
                Se detecta una brecha del <span className="text-emerald-400 font-bold">28%</span> en la dimensión de "Metadatos". 
                Te sugerimos automatizar el etiquetado de activos en Dataplex para mejorar la trazabilidad.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-slate-200 transition-colors">
              Aplicar Sugerencia
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Roadmap */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-8">Hoja de Ruta de Cumplimiento</h3>
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-12">
          {[
            { title: 'Establecer Linaje Automático', date: 'Q2 2024', desc: 'Integración completa con Dataplex Lineage.', color: 'bg-blue-600' },
            { title: 'Certificación ISO 8000', date: 'Q3 2024', desc: 'Auditoría externa de procesos de calidad maestra.', color: 'bg-slate-200' },
            { title: 'IA Generativa para Limpieza', date: 'Q4 2024', desc: 'Implementación de agentes de corrección automática.', color: 'bg-slate-200' },
          ].map((item, i) => (
            <div key={i} className="relative pl-8">
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${item.color}`} />
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

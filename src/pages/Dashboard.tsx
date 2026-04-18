import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity 
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const DashboardSummary = ({ ruleCount }: { ruleCount: number }) => {
  const summary = [
    { label: 'Puntuación Global', value: '94.2%', change: '+2.1%', trend: 'up' },
    { label: 'Tablas Monitoreadas', value: '1,284', change: '+12', trend: 'up' },
    { label: 'Reglas Activas', value: ruleCount.toString(), change: 'Live', trend: 'neutral' },
    { label: 'Alertas (24h)', value: '8', change: '-4', trend: 'down' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {summary.map((item, i) => (
        <StatCard key={i} item={item} />
      ))}
    </div>
  );
};
const MOCK_DATA = {
  dimensionPerformance: [
    { dimension: 'Completitud', score: 98 },
    { dimension: 'Validez', score: 92 },
    { dimension: 'Unicidad', score: 99 },
    { dimension: 'Consistencia', score: 88 },
    { dimension: 'Actualidad', score: 95 },
  ],
  historicalTrends: [
    { date: '2024-03-01', score: 90 },
    { date: '2024-03-05', score: 92 },
    { date: '2024-03-10', score: 91 },
    { date: '2024-03-15', score: 94 },
    { date: '2024-03-20', score: 93 },
    { date: '2024-03-25', score: 94.2 },
  ]
};

const StatCard = ({ item }: { item: any, key?: any }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm"
  >
    <div className="flex justify-between items-start">
      <p className="text-sm font-semibold text-brand-muted uppercase tracking-wider">{item.label}</p>
      <div className={`p-1.5 rounded-lg ${
        item.trend === 'up' ? 'bg-brand-success/10 text-brand-success' : 
        item.trend === 'down' ? 'bg-brand-danger/10 text-brand-danger' : 'bg-slate-100 text-brand-muted'
      }`}>
        {item.trend === 'up' ? <ArrowUpRight size={16} /> : 
         item.trend === 'down' ? <ArrowDownRight size={16} /> : <Activity size={16} />}
      </div>
    </div>
    <div className="mt-4 flex items-baseline gap-2">
      <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
      <span className={`text-xs font-semibold ${
        item.trend === 'up' ? 'text-emerald-600' : 
        item.trend === 'down' ? 'text-rose-600' : 'text-slate-500'
      }`}>
        {item.change}
      </span>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [ruleCount, setRuleCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'dq_rules'), where('status', '==', 'active'));
    
    // Using explicit error handler for onSnapshot
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        setRuleCount(snapshot.size);
      },
      (error) => {
        console.error("Firestore Snapshot Error [dq_rules]:", error);
        // Fallback for UI if permission denied
        if (error.code === 'permission-denied') {
          setRuleCount(0);
        }
      }
    );
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 bg-brand-bg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Dashboard General</h1>
          <p className="text-brand-muted mt-1 text-sm lg:text-base">Visión consolidada de la calidad de datos en GCP.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <button className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-brand-border rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Exportar
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all">
            Escanear Todo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardSummary ruleCount={ruleCount} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dimension Performance */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-bold text-brand-muted uppercase tracking-widest mb-8">Desempeño por Dimensión</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_DATA.dimensionPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis 
                  dataKey="dimension" 
                  type="category" 
                  width={100} 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={11}
                  className="font-bold text-brand-muted"
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16}>
                  {MOCK_DATA.dimensionPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score > 95 ? '#10b981' : entry.score > 90 ? '#0284c7' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-sm font-bold text-brand-muted uppercase tracking-widest">Tendencia de Calidad</h3>
              <p className="text-xs text-brand-muted mt-1">Evolución de puntuación promedio (30d)</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA.historicalTrends}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  fontWeight={600}
                  className="text-brand-muted"
                  tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0284c7" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Issues List */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Alertas de Dataplex Recientes</h3>
          <button className="text-brand-primary text-xs font-bold uppercase tracking-wider hover:underline">Ver todas</button>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-2.5 bg-brand-danger/10 text-brand-danger rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1 w-full">
                <p className="text-sm font-bold text-slate-900">Scan Fallido: raw_events_telemetry</p>
                <p className="text-[11px] text-brand-muted mt-1 uppercase tracking-wider font-medium">Dataset: <span className="text-slate-700 font-bold">ds_ventas</span> • Impacto: <span className="text-brand-danger font-bold">Crítico</span></p>
              </div>
              <div className="flex justify-between sm:block w-full sm:w-auto text-right">
                <span className="px-2 py-0.5 bg-brand-danger/10 text-brand-danger text-[10px] font-bold rounded uppercase">Falla</span>
                <p className="text-[10px] text-brand-muted mt-1 font-medium flex items-center gap-1 justify-end">
                  <Clock size={10} /> Hace 2h
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Play, 
  Settings,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  X as XIcon,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { DQ_DIMENSIONS, FRAMEWORKS } from '../constants';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp,
  updateDoc
} from 'firebase/firestore';

interface DQRule {
  id: string;
  name: string;
  tableId: string;
  dimension: string;
  framework: string;
  status: 'active' | 'inactive';
  config: string;
  createdAt: any;
}

export default function Rules() {
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [rules, setRules] = useState<DQRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // New Rule Form
  const [formData, setFormData] = useState({
    name: '',
    dimension: 'completeness',
    tableId: searchParams.get('tableId') || 'customers.profiles',
    framework: 'ISO 8000',
    config: 'rule:\n  type: range\n  column: total_amount\n  min: 0\n  max: 1000000'
  });

  useEffect(() => {
    if (searchParams.get('tableId')) {
      setShowModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const q = query(collection(db, 'dq_rules'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DQRule[];
      setRules(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      setSaving(true);
      const docRef = await addDoc(collection(db, 'dq_rules'), {
        ...formData,
        status: 'active',
        createdAt: Timestamp.now()
      });
      setRules([{ id: docRef.id, ...formData, status: 'active', createdAt: Timestamp.now() } as any, ...rules]);
      setShowModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta regla?')) return;
    try {
      await deleteDoc(doc(db, 'dq_rules', id));
      setRules(rules.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-brand-bg">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Motor de Reglas</h1>
          <p className="text-brand-muted mt-1">Configura y administra auditorías de calidad automatizadas.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all"
        >
          <Plus size={20} />
          Nueva Regla
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, tabla o ID..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-brand-border rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
          />
        </div>
        <select className="px-4 py-2 bg-slate-50 border border-brand-border rounded-lg text-sm font-bold text-slate-700 outline-none hover:bg-white transition-colors">
          <option>Todas las Dimensiones</option>
          {DQ_DIMENSIONS.map(d => <option key={d.id}>{d.label}</option>)}
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border border-brand-border text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-bold transition-all">
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase tracking-widest text">
              <th className="px-6 py-4">Regla de Calidad</th>
              <th className="px-6 py-4">BigQuery Asset</th>
              <th className="px-6 py-4">Dimensión</th>
              <th className="px-6 py-4">Framework</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                    <p className="text-sm text-brand-muted">Cargando reglas...</p>
                  </div>
                </td>
              </tr>
            ) : rules.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <p className="text-sm text-brand-muted">No hay reglas configuradas. ¡Crea la primera!</p>
                </td>
              </tr>
            ) : rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-900">{rule.name}</p>
                  <p className="text-[10px] text-brand-muted mt-1 uppercase tracking-wider font-medium">ID: {rule.id.substring(0, 8)}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-mono text-slate-600">{rule.tableId}</p>
                </td>
                <td className="px-6 py-5">
                  <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-md text-[10px] font-bold uppercase tracking-wider">{rule.dimension}</span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs font-bold text-slate-600">{rule.framework}</p>
                </td>
                <td className="px-6 py-5 text-slate-500">
                  <div className="flex items-center gap-2 font-bold">
                    <div className={cn("w-1.5 h-1.5 rounded-full", rule.status === 'active' ? "bg-brand-success" : "bg-slate-300")} />
                    <span className="text-[11px] uppercase tracking-wider text-slate-700">{rule.status === 'active' ? 'Activa' : 'Inactiva'}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all" title="Ejecutar ahora"><Play size={16} /></button>
                    <button className="p-2 text-brand-muted hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"><Settings size={16} /></button>
                    <button onClick={() => handleDelete(rule.id)} className="p-2 text-brand-muted hover:text-brand-danger hover:bg-brand-danger/5 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Mockup */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
           <motion.div 
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-brand-border"
           >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Definir Nueva Regla de Calidad</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-colors">
                  <X />
                </button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Nombre de Regla</label>
                      <input 
                        type="text" 
                        placeholder="Ej: null_check_orders" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all text-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Dimensión DQ</label>
                      <select 
                        value={formData.dimension}
                        onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none text-sm font-bold text-slate-700"
                      >
                        {DQ_DIMENSIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                      </select>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Tipo de Validación</label>
                    <div className="grid grid-cols-3 gap-3">
                       {['Valor Nulo', 'Rango', 'Regex', 'ID Único', 'Referencial', 'Sugerencia IA'].map(t => (
                         <button 
                           key={t} 
                           onClick={() => setFormData({ ...formData, config: `${formData.config}\ntype: ${t.toLowerCase()}` })}
                           className="px-4 py-3 bg-white border border-brand-border rounded-xl text-xs font-bold text-slate-700 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Configuración Técnica (YAML/SQL)</label>
                    <textarea 
                      value={formData.config}
                      onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                      className="w-full h-32 px-4 py-3 bg-slate-900 text-brand-primary font-mono text-sm rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary leading-relaxed shadow-inner"
                    />
                 </div>
              </div>
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                 <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-brand-muted font-bold hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                 <button 
                  disabled={saving || !formData.name}
                  onClick={handleCreateRule}
                  className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all disabled:opacity-50"
                 >
                   {saving ? 'Guardando...' : 'Guardar Regla'}
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}

const X = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

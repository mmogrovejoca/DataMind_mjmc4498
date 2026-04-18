import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  Database, 
  Table as TableIcon, 
  Projector, 
  Filter,
  RefreshCw,
  Plus,
  ArrowRight,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Asset {
  id: string;
  name: string;
  type: 'project' | 'dataset' | 'table';
  children?: Asset[];
}

const MOCK_ASSETS: Asset[] = [
  {
    id: 'p1',
    name: 'prod-data-lake-1234',
    type: 'project',
    children: [
      {
        id: 'd1',
        name: 'raw_sales_data',
        type: 'dataset',
        children: [
          { id: 't1', name: 'transactions_daily', type: 'table' },
          { id: 't2', name: 'customer_profiles', type: 'table' },
          { id: 't3', name: 'store_inventory_v2', type: 'table' },
        ]
      },
      {
        id: 'd2',
        name: 'master_product_catalog',
        type: 'dataset',
        children: [
          { id: 't4', name: 'categories', type: 'table' },
          { id: 't5', name: 'skus_active', type: 'table' },
        ]
      }
    ]
  },
  {
    id: 'p2',
    name: 'analytics-dw-5678',
    type: 'project',
    children: [
      {
        id: 'd3',
        name: 'reporting_marts',
        type: 'dataset',
        children: [
          { id: 't6', name: 'fct_sales_summary', type: 'table' },
          { id: 't7', name: 'dim_geography', type: 'table' },
        ]
      }
    ]
  }
];

export default function Explorer() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gcp/projects');
      const data = await res.json();
      setAssets(data.map((p: any) => ({ ...p, type: 'project', children: [] })));
    } catch (e) {
      console.error(e);
      setAssets(MOCK_ASSETS);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async (asset: Asset) => {
    if (asset.children && asset.children.length > 0) return;

    try {
      let endpoint = '';
      if (asset.type === 'project') {
        endpoint = `/api/gcp/datasets/${asset.id}`;
      } else if (asset.type === 'dataset') {
        // Need to find parent project ID
        const projectId = findParentProject(assets, asset.id);
        endpoint = `/api/gcp/tables/${projectId}/${asset.id}`;
      } else {
        return;
      }

      const res = await fetch(endpoint);
      const data = await res.json();
      
      const newType = asset.type === 'project' ? 'dataset' : 'table';
      const children = data.map((item: any) => ({ ...item, type: newType, children: newType === 'dataset' ? [] : undefined }));
      
      updateAssets(asset.id, children);
    } catch (e) {
      console.error(e);
    }
  };

  const findParentProject = (list: Asset[], id: string): string => {
    for (const p of list) {
       if (p.children?.some(c => c.id === id)) return p.id;
    }
    return '';
  };

  const updateAssets = (id: string, children: Asset[]) => {
    setAssets(prev => {
      const deepUpdate = (list: Asset[]): Asset[] => {
        return list.map(a => {
          if (a.id === id) return { ...a, children };
          if (a.children) return { ...a, children: deepUpdate(a.children) };
          return a;
        });
      };
      return deepUpdate(prev);
    });
  };

  const toggleExpand = async (asset: Asset) => {
    if (!expanded.includes(asset.id)) {
      await fetchChildren(asset);
    }
    setExpanded(prev => 
      prev.includes(asset.id) ? prev.filter(x => x !== asset.id) : [...prev, asset.id]
    );
  };

  const renderAsset = (asset: Asset, depth = 0) => {
    const isExpanded = expanded.includes(asset.id);
    const hasChildren = asset.children && asset.children.length > 0;

    return (
      <div key={asset.id} className="select-none">
        <div 
          onClick={() => {
            if (asset.type !== 'table') toggleExpand(asset);
            if (asset.type === 'table') setSelectedAsset(asset);
          }}
          className={`
            flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors
            ${selectedAsset?.id === asset.id ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-slate-50 text-slate-700'}
          `}
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        >
          {hasChildren ? (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              className="text-slate-400"
            >
              <ChevronRight size={16} />
            </motion.div>
          ) : (
            <div className="w-4" />
          )}
          
          {asset.type === 'project' && <div className="text-slate-400"><Projector size={16} /></div>}
          {asset.type === 'dataset' && <div className="text-amber-500"><Database size={16} /></div>}
          {asset.type === 'table' && <div className="text-blue-500"><TableIcon size={16} /></div>}
          
          <span className={`text-sm ${asset.type === 'project' ? 'font-bold uppercase tracking-wider text-[10px] bg-slate-100 px-1.5 py-0.5 rounded' : 'font-medium'}`}>
            {asset.name}
          </span>
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {asset.children!.map(child => renderAsset(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-brand-bg">
      {/* Sidebar Tree */}
      <div className={cn(
        "w-full lg:w-1/3 border-r border-brand-border bg-white flex flex-col shadow-sm transition-all overflow-hidden",
        selectedAsset ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-muted uppercase tracking-widest">Activos de GCP</h2>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-brand-muted transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
            <input 
              type="text" 
              placeholder="Buscar proyectos..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-brand-border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="animate-spin text-brand-primary" size={24} />
            </div>
          )}
          {assets.map(asset => renderAsset(asset))}
        </div>
      </div>

      {/* Main Content Detail */}
      <div className={cn(
        "flex-1 overflow-y-auto scrollbar-thin",
        !selectedAsset ? "hidden lg:block" : "block"
      )}>
        {selectedAsset ? (
          <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6 lg:space-y-8">
            <button 
              onClick={() => setSelectedAsset(null)}
              className="lg:hidden flex items-center gap-2 text-brand-primary font-bold mb-4"
            >
              <ChevronLeft size={20} />
              Volver al Explorador
            </button>
            <div className="bg-white p-6 lg:p-8 rounded-2xl border border-brand-border shadow-sm flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <div className="bg-brand-primary/10 p-2.5 rounded-xl text-brand-primary"><TableIcon size={24} /></div>
                   <span className="text-[10px] font-bold text-brand-muted tracking-widest uppercase">BigQuery Asset</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedAsset.name}</h1>
                <p className="text-sm text-brand-muted">Ubicación: <span className="font-bold text-slate-700">US Multi-region</span> • Dataset: <span className="font-bold text-slate-700">raw_sales_data</span></p>
              </div>
              <button 
                onClick={() => navigate(`/rules?tableId=${selectedAsset.name}`)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all"
              >
                <Plus size={20} />
                Gestionar Reglas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-brand-primary p-8 rounded-3xl text-white shadow-xl space-y-4 relative overflow-hidden group">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Score de Calidad General</span>
                    <RefreshCw size={16} className="text-white/40 animate-spin-slow" />
                  </div>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <h2 className="text-6xl font-bold tracking-tighter">96.8</h2>
                    <span className="text-xl font-medium text-white/60">%</span>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                    <p className="text-sm font-bold text-white/90">Estado: Excelente</p>
                    <span className="text-[10px] uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">DAMA Tier 1</span>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-6">
                  <span className="text-brand-muted text-[10px] font-bold uppercase tracking-widest">Metadata Dataplex</span>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                      <span className="text-brand-muted">Clasificación:</span>
                      <span className="font-bold text-slate-900">Sensitive PI</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                      <span className="text-brand-muted">Propietario:</span>
                      <span className="font-bold text-brand-primary hover:underline cursor-pointer">Marketing Analytics</span>
                    </div>
                    <div className="flex justify-between text-sm py-2">
                      <span className="text-brand-muted">Refresco:</span>
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        <Clock size={12} className="text-brand-success" /> Hoy, 14:22 PM
                      </span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Validaciones de Calidad Activas</h3>
                <span className="bg-brand-success/10 text-brand-success px-2 py-0.5 rounded text-[10px] font-bold">12 PASSED</span>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                      <th className="px-6 py-4">Filtro / Regla</th>
                      <th className="px-6 py-4">Dimensión</th>
                      <th className="px-6 py-4">Threshold</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    <tr className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-900">Null check (cliente_id)</td>
                      <td className="px-6 py-5 text-brand-muted font-medium uppercase text-[11px]">Completitud</td>
                      <td className="px-6 py-5">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="w-full h-full bg-brand-success"></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 block">99.9%</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-brand-success/10 text-brand-success rounded-md text-[10px] font-bold uppercase tracking-wider">Cumple</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-brand-muted group-hover:text-brand-primary group-hover:bg-brand-primary/5 rounded-lg transition-all">
                          <ArrowRight size={18} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-primary/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="bg-white p-8 rounded-3xl border border-brand-border text-brand-muted shadow-lg relative z-10 transition-transform hover:scale-105">
                <Database size={64} className="text-slate-300" />
              </div>
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Explorador de Datos</h3>
              <p className="text-sm text-brand-muted">Selecciona una tabla o dataset a la izquierda para visualizar sus métricas de calidad y linaje.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

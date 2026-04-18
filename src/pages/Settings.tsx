import { useState } from 'react';
import { Key, Shield, Info, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';

export default function Settings() {
  const [authMode, setAuthMode] = useState<'service_account' | 'oauth'>('service_account');
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8 bg-brand-bg">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Configuración de Conexión</h1>
        <p className="text-brand-muted text-sm lg:text-base">Administra los accesos y credenciales para conectarse a Google Cloud Platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-2 rounded-2xl border border-brand-border">
        <button 
          onClick={() => setAuthMode('service_account')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm ${
            authMode === 'service_account' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-muted hover:bg-slate-50'
          }`}
        >
          <Shield size={18} />
          Service Account (JSON)
        </button>
        <button 
          onClick={() => setAuthMode('oauth')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-sm ${
            authMode === 'oauth' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-muted hover:bg-slate-50'
          }`}
        >
          <Key size={18} />
          OAuth 2.0 (Google)
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-6 lg:p-8 space-y-6">
          {authMode === 'service_account' ? (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-amber-800 leading-relaxed">
                  Las credenciales de Service Account permiten acceso directo. 
                  Asegúrate de otorgar <span className="font-bold">roles/bigquery.metadataViewer</span> y <span className="font-bold">roles/dataplex.viewer</span> como mínimo.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Contenido del Archivo JSON</label>
                <div className="relative group">
                  <textarea 
                    placeholder='{ "type": "service_account", ... }'
                    className="w-full h-48 px-4 py-3 bg-slate-50 border border-brand-border rounded-2xl font-mono text-xs outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all resize-none"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white border border-brand-border rounded-lg text-brand-muted hover:text-brand-primary shadow-sm">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center py-8">
              <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Key size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Autenticación vía Google Cloud</h3>
                <p className="text-brand-muted max-w-sm mx-auto text-sm leading-relaxed">
                  Haz clic para iniciar el flujo de autorización y otorgar permisos a DataMindDQ directamente a través de tu cuenta.
                </p>
              </div>
              <button 
                className="w-full sm:w-auto px-10 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all text-sm"
              >
                Vincular Cuenta de Google
              </button>
            </div>
          )}
        </div>

        <div className="px-6 lg:px-8 py-6 bg-slate-50/50 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="text-brand-success" size={18} />
                <span className="text-sm font-bold text-slate-900">Configuración Guardada</span>
              </>
            ) : (
              <>
                <Info className="text-brand-muted" size={18} />
                <span className="text-sm font-medium text-brand-muted">Conexión no verificada</span>
              </>
            )}
          </div>
          <button 
            onClick={async () => {
              // Mocking a verification call
              setIsConnected(true);
              setTimeout(() => setIsConnected(false), 3000);
            }}
            className="w-full sm:w-auto px-8 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm shadow-lg shadow-slate-200"
          >
            {isConnected ? 'Verificando...' : 'Guardar y Testear'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-lg tracking-tight">Seguridad y Privacidad</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {[
            { label: 'Cifrado AES-256', desc: 'Credenciales cifradas de extremo a extremo.' },
            { label: 'Least Privilege', desc: 'Solo requerimos permisos de auditoría.' },
            { label: 'Audit Logging', desc: 'Trazabilidad total de accesos a GCP.' },
          ].map((item, i) => (
            <div key={i} className="p-5 bg-white border border-brand-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-bold text-slate-900">{item.label}</p>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

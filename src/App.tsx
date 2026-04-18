import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  ShieldCheck, 
  AlertCircle, 
  History, 
  Menu, 
  X,
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { FirebaseProvider, useFirebase } from './lib/FirebaseProvider';
import { auth, signInWithGoogle } from './lib/firebase';
import { signOut } from 'firebase/auth';
import Dashboard from './pages/Dashboard';
import Explorer from './pages/Explorer';
import Rules from './pages/Rules';
import SettingsPage from './pages/Settings';
import Governance from './pages/Governance';
import { LogIn } from 'lucide-react';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  to, 
  active 
}: { 
  icon: any, 
  label: string, 
  to: string, 
  active: boolean 
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
      active 
        ? "bg-brand-primary text-white" 
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "text-brand-muted group-hover:text-white")} />
    <span className="font-medium">{label}</span>
    {active && (
      <motion.div
        layoutId="active-pill"
        className="ml-auto w-1 h-1 bg-white rounded-full"
      />
    )}
  </Link>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, userProfile, loading } = useFirebase();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-sidebar p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-8 text-center">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto text-white font-bold text-3xl">D</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">DataMindDQ</h1>
            <p className="text-slate-500 font-medium">Gestión Inteligente de Calidad de Datos</p>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-brand-border">
             <p className="text-sm text-slate-600">Bienvenido de nuevo. Por favor, inicia sesión para acceder a tu panel de gobernanza.</p>
             <button 
               onClick={signInWithGoogle}
               className="w-full flex items-center justify-center gap-3 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20"
             >
               <LogIn size={20} />
               Iniciar sesión con Google
             </button>
          </div>

          <div className="pt-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Enterprise Grade Data Quality
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-bg relative overflow-x-hidden">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "bg-brand-sidebar text-white transition-all duration-300 flex flex-col fixed inset-y-0 z-50",
        isSidebarOpen ? "w-64" : "w-0 lg:w-20 overflow-hidden lg:overflow-visible"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0 h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center font-bold text-lg">D</div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl tracking-tight"
              >
                DataMind
              </motion.span>
            )}
          </div>
          <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          <SidebarItem 
            icon={LayoutDashboard} 
            label={isSidebarOpen ? "Dashboard" : ""} 
            to="/" 
            active={location.pathname === '/'} 
          />
          <SidebarItem 
            icon={Database} 
            label={isSidebarOpen ? "Explorador GCP" : ""} 
            to="/explorer" 
            active={location.pathname === '/explorer'} 
          />
          <SidebarItem 
            icon={ShieldCheck} 
            label={isSidebarOpen ? "Reglas DQ" : ""} 
            to="/rules" 
            active={location.pathname === '/rules'} 
          />
          <SidebarItem 
            icon={AlertCircle} 
            label={isSidebarOpen ? "Gobernanza" : ""} 
            to="/governance" 
            active={location.pathname === '/governance'} 
          />
        </nav>

        <div className="p-4 border-t border-white/10">
          <SidebarItem 
            icon={Settings} 
            label={isSidebarOpen ? "Configuración" : ""} 
            to="/settings" 
            active={location.pathname === '/settings'} 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-w-0 flex flex-col",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-20",
        "ml-0"
      )}>
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-lg text-brand-muted"
            >
              {isSidebarOpen ? <X size={20} className="hidden lg:block" /> : <Menu size={20} />}
            </button>
            <h2 className="font-bold text-slate-800 lg:hidden truncate max-w-[120px]">
              {location.pathname === '/' ? 'Dashboard' : 
               location.pathname === '/explorer' ? 'Explorador' :
               location.pathname === '/rules' ? 'Reglas' : 'Config'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar activos o reglas..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-brand-border rounded-lg text-sm w-64 focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all outline-none"
              />
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-brand-border">
              <button 
                onClick={() => signOut(auth)}
                className="p-2 text-brand-muted hover:text-brand-danger hover:bg-brand-danger/5 rounded-lg transition-colors mr-2"
                title="Cerrar sesión"
              >
                <X size={18} />
              </button>
              <div className="w-8 h-8 bg-slate-100 border border-brand-border rounded-full flex items-center justify-center text-brand-primary text-xs font-bold">
                {user.displayName?.split(' ').map(n => n[0]).join('') || user.email?.substring(0,2).toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user.displayName || 'Usuario'}</p>
                <p className="text-[11px] text-brand-muted mt-1 uppercase tracking-wider font-medium">{userProfile?.role || 'Visitante'}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <FirebaseProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </FirebaseProvider>
  );
}

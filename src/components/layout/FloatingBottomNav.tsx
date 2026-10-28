import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  BookOpen, 
  Compass
} from 'lucide-react';
import { ViewKey } from './AppSidebar';

interface FloatingBottomNavProps {
  currentView: ViewKey;
  onChangeView: (view: ViewKey) => void;
  onOpenMenu?: () => void;
  activeScreenNumber?: number;
  activeSurveyProgress?: number;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  currentView,
  onChangeView,
  activeScreenNumber = 1,
  activeSurveyProgress
}) => {
  const isDashboardActive = currentView === 'dashboard';
  const isKuesionerActive = 
    currentView === 'kuesioner' || 
    currentView === 'kuesioner-pemetaan' || 
    currentView === 'kuesioner-sastra-lisan' || 
    currentView === 'kuesioner-vitalitas' || 
    currentView === 'kuesioner-revitalisasi' || 
    currentView === 'form-screen' || 
    currentView === 'form-all' || 
    currentView === 'kondisi-bahasa' || 
    currentView === 'sastra-lisan' || 
    currentView === 'revitalisasi';
  const isKosakataActive = currentView === 'kosakata';
  const isDialekPetaActive = currentView === 'dialektometri';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      isActive: isDashboardActive,
      onClick: () => onChangeView('dashboard'),
      badge: null
    },
    {
      id: 'kuesioner',
      label: 'Kuesioner',
      icon: Layers,
      isActive: isKuesionerActive,
      onClick: () => onChangeView('kuesioner'),
      badge: null
    },
    {
      id: 'kosakata',
      label: 'Kosakata',
      icon: BookOpen,
      isActive: isKosakataActive,
      onClick: () => onChangeView('kosakata'),
      badge: null
    },
    {
      id: 'dialek-peta',
      label: 'Dialek/Peta',
      icon: Compass,
      isActive: isDialekPetaActive,
      onClick: () => onChangeView('dialektometri'),
      badge: null
    }
  ];

  return (
    <aside 
      className="fixed bottom-3.5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.25rem)] max-w-sm sm:max-w-fit pointer-events-auto"
      aria-label="Navigasi Utama Menggantung"
    >
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_10px_35px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] rounded-full p-1.5 sm:px-3 sm:py-2 flex items-center justify-between sm:justify-start gap-1 sm:gap-2 ring-1 ring-black/5 dark:ring-white/5 transition-all">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`group relative flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none min-h-[44px] sm:min-h-0 ${
                active
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95'
              }`}
              title={`Buka tampilan ${item.label}`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
                  active ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                }`} />
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2.5 text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                    active 
                      ? 'bg-white text-blue-600 shadow-2xs' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-xs whitespace-nowrap tracking-tight leading-none sm:leading-normal ${
                active ? 'font-bold' : 'font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

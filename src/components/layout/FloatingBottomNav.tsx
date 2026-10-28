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

const KUESIONER_VIEWS: ViewKey[] = [
  'kuesioner',
  'kuesioner-pemetaan',
  'kuesioner-sastra-lisan',
  'kuesioner-vitalitas',
  'kuesioner-revitalisasi',
  'form-screen',
  'form-all',
  'kondisi-bahasa',
  'sastra-lisan',
  'revitalisasi'
];

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  currentView,
  onChangeView
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      isActive: currentView === 'dashboard',
      onClick: () => onChangeView('dashboard')
    },
    {
      id: 'kuesioner',
      label: 'Kuesioner',
      icon: Layers,
      isActive: KUESIONER_VIEWS.includes(currentView),
      onClick: () => onChangeView('kuesioner')
    },
    {
      id: 'kosakata',
      label: 'Kosakata',
      icon: BookOpen,
      isActive: currentView === 'kosakata',
      onClick: () => onChangeView('kosakata')
    },
    {
      id: 'dialek-peta',
      label: 'Dialek/Peta',
      icon: Compass,
      isActive: currentView === 'dialektometri',
      onClick: () => onChangeView('dialektometri')
    }
  ];

  return (
    <aside 
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md pointer-events-auto"
      aria-label="Navigasi Utama"
    >
      {/* M3 Navigation bar: surface-container with pill active indicators */}
      <nav className="bg-[var(--md-surface-container)] dark:bg-[var(--md-surface-container-high)] shadow-lg rounded-[28px] px-2 py-2 flex items-stretch justify-between gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              aria-current={active ? 'page' : undefined}
              className="group flex-1 flex flex-col items-center justify-center gap-1 py-1 cursor-pointer select-none min-h-12"
              title={`Buka tampilan ${item.label}`}
            >
              <span
                className={`flex items-center justify-center w-16 h-8 rounded-full transition-colors duration-200 ${
                  active
                    ? 'bg-blue-100 text-blue-950 dark:bg-blue-700 dark:text-blue-50'
                    : 'text-[var(--md-on-surface-variant)] group-hover:bg-[var(--md-on-surface)]/[0.08]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span
                className={`text-xs leading-4 whitespace-nowrap ${
                  active
                    ? 'font-semibold text-[var(--md-on-surface)]'
                    : 'font-medium text-[var(--md-on-surface-variant)]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

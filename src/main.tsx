import './utils/leafletPatch';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import App from './App.tsx';
import './index.css';

// Automatically register service worker for offline caching and PWA functionality
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[PWA] Konten versi baru tersedia.');
    },
    onOfflineReady() {
      console.log('[PWA] Aplikasi siap bekerja secara offline.');
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ThemeProvider>,
);

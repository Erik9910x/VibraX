'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import FloatingPlayer from '@/components/layout/FloatingPlayer';
import { usePlaylistStore } from '@/lib/store';
import { mockPlaylists } from '@/data/mockData';
import { useEffect, useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const initDefaults = usePlaylistStore((s) => s.initDefaults);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initDefaults(mockPlaylists);
    
    // Inject Google Translate script dynamically to avoid React hydration errors
    if (typeof window !== 'undefined' && !(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = function() {
        new (window as any).google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
      };
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [initDefaults]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      <div id="google_translate_element" className="hidden"></div>
      
      <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col lg:ml-[280px] pb-[var(--player-height)] overflow-hidden transition-[margin] duration-300">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      
      <FloatingPlayer />
    </div>
  );
}

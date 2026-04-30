'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Bell, User, Menu, Globe, Heart, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [currentLang, setCurrentLang] = useState('English');

  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Tiếng Việt', code: 'vi' },
    { name: 'Español', code: 'es' },
    { name: 'Français', code: 'fr' },
    { name: 'Deutsch', code: 'de' },
    { name: '日本語', code: 'ja' },
    { name: '한국어', code: 'ko' },
    { name: '中文', code: 'zh-CN' },
    { name: 'Italiano', code: 'it' },
    { name: 'Português', code: 'pt' }
  ];

  useEffect(() => {
    // Load language from storage on mount
    const savedLang = localStorage.getItem('vibra_language');
    if (savedLang) {
      const found = languages.find(l => l.code === savedLang);
      if (found) setCurrentLang(found.name);
    }

    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[var(--topbar-height)] px-4 sm:px-6 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/[0.04]">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-colors mr-1"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        
        {/* Navigation arrows */}
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors hidden sm:flex"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.forward()}
          className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors hidden sm:flex"
          aria-label="Go forward"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowDonation(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fcd535] hover:bg-[#f0b90b] transition-colors shadow-lg shadow-[#fcd535]/20"
        >
          <Heart className="w-4 h-4 text-black fill-black" />
          <span className="text-sm font-bold text-black">Support Us</span>
        </button>

        <div className="relative" ref={langRef}>
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-colors"
            title="Language / Ngôn ngữ"
          >
            <Globe className="w-4 h-4 text-white/70" />
          </button>
          
          {showLangMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 py-2 rounded-xl bg-[#1e2329] border border-white/10 shadow-2xl z-50">
              <div className="px-4 py-2 text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Language</div>
              <div className="max-h-64 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      localStorage.setItem('vibra_language', lang.code);
                      document.cookie = `googtrans=/en/${lang.code}; path=/;`;
                      document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname}`;
                      setCurrentLang(lang.name);
                      setShowLangMenu(false);
                      window.location.reload();
                    }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors ${currentLang === lang.name ? 'text-[#fcd535] bg-white/[0.08]' : 'text-white/80 hover:text-white hover:bg-white/[0.06]'}`}
                  >
                    <span style={{ fontFamily: 'sans-serif' }}>{lang.name}</span>
                    {currentLang === lang.name && <span className="w-1.5 h-1.5 rounded-full bg-[#fcd535]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center relative group">
          <input 
            id="presetInput"
            type="text" 
            placeholder="Import Preset..." 
            className="w-40 lg:w-56 h-8 pl-3 pr-16 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#fcd535] transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') document.getElementById('applyPresetBtn')?.click();
            }}
          />
          <button 
            id="applyPresetBtn"
            className="absolute right-1 w-14 h-6 rounded-full bg-[#fcd535] text-black text-[10px] font-black uppercase tracking-wider hover:bg-[#f0b90b] transition-colors"
            onClick={async () => {
              const input = document.getElementById('presetInput') as HTMLInputElement;
              let val = input?.value?.trim();
              if (!val) return;
              try {
                const { loadPreset } = await import('@/lib/supabase');
                const state = await loadPreset(val);
                const { useFavoritesStore, usePlaylistStore, useArtistStore } = await import('@/lib/store');
                if (state.favorites) useFavoritesStore.setState({ favoriteIds: state.favorites });
                if (state.playlists) usePlaylistStore.setState({ playlists: state.playlists });
                if (state.artists) useArtistStore.setState({ followedArtists: state.artists });
                alert('Khôi phục Preset thành công!');
                input.value = '';
              } catch (err: any) {
                alert(err.message || 'Mã Preset không hợp lệ!');
              }
            }}
          >
            Apply
          </button>
        </div>

        <button className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-colors relative">
          <Bell className="w-4 h-4 text-white/70" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#f6465d] rounded-full border-2 border-[#0a1628]" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#fcd535] flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-[#181a20]" />
          </div>
          <span className="text-sm font-medium text-white/80 hidden sm:inline notranslate">Guest</span>
        </button>
      </div>

      {/* Donation Modal - Rendered via Portal to escape header's stacking context */}
      {showDonation && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-2xl transition-all duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm p-8 rounded-2xl bg-[#132D46] border border-[#fcd535]/30 text-center"
          >
            <button
              onClick={() => setShowDonation(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
            <div className="mb-8 mt-4 flex flex-col items-center justify-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/support.gif" alt="Support VibraX" className="w-64 h-64 rounded-2xl object-cover shadow-2xl border border-white/10" />
              <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Scan QR above to support</p>
            </div>
            <h3 className="text-3xl font-black text-white mb-4">Support VibraX</h3>
            <p className="text-lg font-bold text-[#fcd535] leading-relaxed mb-8 px-6">
              Thank you for supporting our continuous development. Your contribution helps keep VibraX alive and free for everyone!
            </p>
            <button
              onClick={() => setShowDonation(false)}
              className="w-full py-4 rounded-full bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-black text-lg transition-all shadow-xl shadow-[#fcd535]/20 active:scale-[0.98]"
            >
              Close
            </button>
          </motion.div>
        </div>,
        document.body
      )}
    </header>
  );
}

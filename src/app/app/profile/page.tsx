'use client';

import { useEffect } from 'react';

import { usePlayerStore, usePlaylistStore, useFavoritesStore, useHistoryStore, useArtistStore } from '@/lib/store';
import { User, Music, Heart, ListMusic, History, Settings, ChevronRight, Share2, Shield, Info, LogOut, Disc, Headphones, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const playlists = usePlaylistStore((s) => s.playlists);
  const recentlyPlayed = useHistoryStore((s) => s.recentlyPlayed);
  const followedArtists = useArtistStore((s) => s.followedArtists);
  
  useEffect(() => {
    document.title = "Profile | VibraX";
    return () => { document.title = "VibraX"; };
  }, []);

  const stats = [
    { label: 'Favorites', value: favoriteIds.length, icon: Heart, color: 'text-red-400' },
    { label: 'Playlists', value: playlists.length, icon: ListMusic, color: 'text-blue-400' },
    { label: 'Following', value: followedArtists.length, icon: User, color: 'text-green-400' },
    { label: 'History', value: recentlyPlayed.length, icon: History, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-full bg-[var(--bg-primary)] pb-12">
      {/* Header / Cover */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fcd535]/20 to-[var(--bg-primary)]" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        
        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center sm:text-left sm:flex-row sm:items-end gap-6 translate-y-1/4 sm:translate-y-0">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#fcd535] to-[#f0b90b] p-1 shadow-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/icon-512.png" 
                alt="Profile" 
                className="w-full h-full rounded-[20px] object-cover bg-[#181a20]"
              />
            </div>
            <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#181a20] border border-white/10 flex items-center justify-center text-white/70 hover:text-[#fcd535] transition-colors shadow-xl">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 pb-4">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
              Guest User
              <div className="px-2 py-0.5 rounded bg-[#fcd535]/10 border border-[#fcd535]/20 text-[10px] font-black text-[#fcd535] uppercase tracking-widest">PRO</div>
            </h1>
            <p className="text-white/50 text-sm font-medium">VibraX Listener since April 2024</p>
          </div>
        </div>
      </div>

      <div className="mt-16 sm:mt-8 px-4 sm:px-8 space-y-8 max-w-5xl mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.03] border border-white/[0.05] p-4 rounded-2xl flex flex-col items-center text-center group hover:bg-white/[0.05] transition-all cursor-default"
            >
              <div className={cn("w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white">{stat.value}</span>
              <span className="text-xs font-bold text-white/30 uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recently Played Snippet */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-[#fcd535]" />
                  Recently Played
                </h2>
                <Link href="/app/library" className="text-xs font-bold text-[#fcd535] hover:underline uppercase tracking-widest">View All</Link>
              </div>
              
              <div className="space-y-2">
                {recentlyPlayed.length > 0 ? (
                  recentlyPlayed.slice(0, 5).map((track, i) => (
                    <div key={track.id + i} className="group flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.05] transition-all cursor-pointer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={track.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
                        <p className="text-xs text-white/40 truncate">{track.artist}</p>
                      </div>
                      <Disc className="w-4 h-4 text-white/20 group-hover:text-[#fcd535] transition-colors" />
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                    <History className="w-8 h-8 text-white/10 mb-2" />
                    <p className="text-white/30 text-sm">No history yet</p>
                  </div>
                )}
              </div>
            </section>

            {/* Achievements/Trophies (Mock) */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#fcd535]" />
                Listening Insights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/[0.05]">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Top Genre</p>
                  <h3 className="text-lg font-black text-white mb-2">Electronic / Phonk</h3>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[75%]" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#fcd535]/10 to-orange-500/10 border border-white/[0.05]">
                  <p className="text-xs font-bold text-[#fcd535] uppercase tracking-widest mb-1">Peak Time</p>
                  <h3 className="text-lg font-black text-white mb-2">Midnight Session</h3>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#fcd535] w-[40%]" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">App Settings</h3>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white">Persistence</span>
                  </div>
                  <div className="w-10 h-5 bg-[#fcd535] rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-[#181a20] rounded-full shadow-sm" />
                  </div>
                </button>
                <button className="w-full flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white">Audio Quality</span>
                  </div>
                  <span className="text-xs font-bold text-[#fcd535] uppercase">HQ (Lossless)</span>
                </button>
                <button className="w-full flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white">Social Mode</span>
                  </div>
                  <div className="w-10 h-5 bg-white/10 rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-[#181a20] rounded-full shadow-sm" />
                  </div>
                </button>
              </div>
              
              <div className="h-px bg-white/[0.06] my-6" />
              
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] text-white/60 hover:text-white transition-all">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">About VibraX</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-30" />
                </button>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-all">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Clear Data & Log Out</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-30" />
                </button>
              </div>
            </div>

            {/* Storage / Cache (App-like feel) */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Device Storage</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Offline Cache</span>
                <span className="text-xs font-bold text-white">124.5 MB</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-[#fcd535] w-[15%]" />
              </div>
              <button 
                onClick={() => alert('Cache cleared successfully!')}
                className="text-[10px] font-black text-[#fcd535] uppercase tracking-widest hover:underline"
              >
                Clear Cache
              </button>
            </div>

            {/* Promo Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#fcd535] to-[#f0b90b] relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <Music className="w-32 h-32 text-[#181a20]" />
              </div>
              <h3 className="text-xl font-black text-[#181a20] mb-2">VibraX Premium</h3>
              <p className="text-[#181a20]/70 text-sm font-bold mb-4 leading-relaxed">
                Enjoy offline playback, no ads, and the highest audio quality.
              </p>
              <button className="px-6 py-2 rounded-full bg-[#181a20] text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

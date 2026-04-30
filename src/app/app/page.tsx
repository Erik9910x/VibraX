'use client';

import { useEffect, useState } from 'react';
import { TrackCard, PlaylistCard, TrackRow } from '@/components/cards/Cards';
import { usePlayerStore, useHistoryStore, usePlaylistStore } from '@/lib/store';
import { getGreeting } from '@/lib/utils';
import { getTrendingTracks, getMoodTracks, searchTracks } from '@/lib/musicapi';
import { Track } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Sparkles, Clock, Music, Loader2, Disc3 } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const moodSearches = [
  { id: 'mood1', name: 'Chill Vibes', emoji: '🌙', color: 'from-indigo-600 to-blue-800', query: 'chill lofi beats' },
  { id: 'mood2', name: 'Workout', emoji: '🔥', color: 'from-red-600 to-orange-600', query: 'workout motivation energy' },
  { id: 'mood3', name: 'Sad Hours', emoji: '💔', color: 'from-purple-700 to-indigo-900', query: 'sad emotional ballad' },
  { id: 'mood4', name: 'Party Mode', emoji: '🎉', color: 'from-yellow-500 to-pink-500', query: 'party dance club hits' },
  { id: 'mood5', name: 'Focus Flow', emoji: '🧠', color: 'from-teal-600 to-cyan-700', query: 'focus study concentration' },
  { id: 'mood6', name: 'Road Trip', emoji: '🚗', color: 'from-green-600 to-emerald-700', query: 'road trip driving songs' },
  { id: 'mood7', name: 'Romantic', emoji: '💕', color: 'from-rose-600 to-pink-800', query: 'romantic love songs' },
  { id: 'mood8', name: 'Hip Hop', emoji: '🎤', color: 'from-amber-600 to-orange-800', query: 'hip hop rap trending' },
];

export default function DiscoverPage() {
  const recentlyPlayed = useHistoryStore((s) => s.recentlyPlayed);
  const playlists = usePlaylistStore((s) => s.playlists);
  const { setQueue } = usePlayerStore();
  const [greeting, setGreeting] = useState('Good evening');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real data from MusicAPI
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [moodTracks, setMoodTracks] = useState<Record<string, Track[]>>({});
  const [forYou, setForYou] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // Fetch real music data
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Get trending tracks
        const trending = await getTrendingTracks();
        if (cancelled) return;
        setTrendingTracks(trending.slice(0, 12));
        setForYou(trending.slice(12, 24));

        // 2. Get new releases
        const releases = await searchTracks('new music 2025', 10);
        if (cancelled) return;
        setNewReleases(releases);

        // 3. Fetch mood tracks in parallel  
        const moodResults: Record<string, Track[]> = {};
        const moodPromises = moodSearches.map(async (mood) => {
          const tracks = await getMoodTracks(mood.query);
          moodResults[mood.id] = tracks;
        });
        await Promise.allSettled(moodPromises);
        if (cancelled) return;
        setMoodTracks(moodResults);

      } catch (err) {
        console.error('Failed to load discover data:', err);
        if (!cancelled) setError('Failed to load music. Check your connection.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 pb-12 space-y-8">
        {/* Skeleton hero */}
        <div className="rounded-2xl bg-white/[0.03] p-8 border border-white/[0.06]">
          <div className="h-8 w-48 bg-white/[0.06] rounded-lg mb-3 animate-pulse" />
          <div className="h-4 w-96 bg-white/[0.04] rounded-lg animate-pulse" />
        </div>
        {/* Loading indicator */}
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <Disc3 className="w-12 h-12 text-[#fcd535] animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white/60 text-sm font-medium">Loading exclusive tracks...</p>
            <p className="text-white/30 text-xs mt-1">Connecting to VibraX Vault</p>
          </div>
        </div>
        {/* Skeleton cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.03] animate-pulse">
              <div className="aspect-square rounded-lg bg-white/[0.04] mb-3" />
              <div className="h-4 w-3/4 bg-white/[0.04] rounded mb-1.5" />
              <div className="h-3 w-1/2 bg-white/[0.03] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && trendingTracks.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-24 gap-4">
        <Music className="w-12 h-12 text-white/10" />
        <p className="text-white/40 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 pb-12 space-y-10">
      {/* Greeting Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent p-8 border border-white/[0.06]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#fcd535]/5 to-[#f0b90b]/5" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">{greeting}</h1>
          <p className="text-[#fcd535]/80 text-sm font-medium">Âm nhạc gắn kết mọi thứ, hãy chìm đắm trong chúng.</p>
        </div>
      </motion.div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-white/40" />
            <h2 className="text-xl font-bold">Recently Played</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {recentlyPlayed.slice(0, 6).map((track, i) => (
              <TrackCard key={track.id} track={track} tracks={recentlyPlayed.slice(0, 6)} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      {trendingTracks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-[#fcd535]" />
            <h2 className="text-xl font-bold">World Top Songs Playlist</h2>
          </div>
          <p className="text-xs text-white/30 mb-4">Updated continuously based on global metrics</p>
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {trendingTracks.map((track, i) => (
              <motion.div key={track.id} variants={item}>
                <TrackCard track={track} tracks={trendingTracks} index={i} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}


      {/* New Releases */}
      {newReleases.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">New Releases</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {newReleases.map((track, i) => (
              <TrackCard key={track.id} track={track} tracks={newReleases} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Your Playlists */}
      {playlists.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {playlists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        </section>
      )}

      {/* Made For You */}
      {forYou.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Music className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold">Made For You</h2>
          </div>
          <p className="text-xs text-white/30 mb-4">More tracks to discover</p>
          <div className="space-y-0.5">
            {forYou.map((track, i) => (
              <TrackRow key={track.id} track={track} tracks={forYou} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

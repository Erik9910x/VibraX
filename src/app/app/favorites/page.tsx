'use client';

import { useFavoritesStore, usePlayerStore, useHistoryStore } from '@/lib/store';
import { Track } from '@/data/mockData';
import { TrackRow } from '@/components/cards/Cards';
import { Heart, Play, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function FavoritesPage() {
  const { favoriteIds } = useFavoritesStore();
  const { setQueue } = usePlayerStore();
  const recentlyPlayed = useHistoryStore((s) => s.recentlyPlayed);

  // Build favorites from history (since tracks are now from real API, not static mock)
  const favoriteTracks = useMemo(() => {
    // We find favorited tracks from the history store (which records all played tracks)
    const trackMap = new Map<string, Track>();
    recentlyPlayed.forEach(t => trackMap.set(t.id, t));
    return favoriteIds
      .map(id => trackMap.get(id))
      .filter((t): t is Track => !!t);
  }, [favoriteIds, recentlyPlayed]);

  const handlePlayAll = () => {
    if (favoriteTracks.length > 0) setQueue(favoriteTracks, 0);
  };

  const handleShuffle = () => {
    if (favoriteTracks.length > 0) {
      const shuffled = [...favoriteTracks].sort(() => Math.random() - 0.5);
      setQueue(shuffled, 0);
    }
  };

  return (
    <div className="pb-12">
      {/* Hero header */}
      <div className="relative p-8 pb-6 bg-gradient-to-b from-pink-600/20 via-purple-900/10 to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end gap-6"
        >
          <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-600/30 flex items-center justify-center flex-shrink-0 border border-white/10">
            <Heart className="w-20 h-20 text-pink-400 fill-pink-400/20" />
          </div>
          <div>
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">Playlist</p>
            <h1 className="text-4xl font-bold mb-2">Liked Songs</h1>
            <p className="text-sm text-white/50">{favoriteTracks.length} songs saved</p>
          </div>
        </motion.div>

        {favoriteTracks.length > 0 && (
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handlePlayAll}
              className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 text-white ml-0.5 fill-white" />
            </button>
            <button
              onClick={handleShuffle}
              className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
            >
              <Shuffle className="w-4 h-4 text-white/60" />
            </button>
          </div>
        )}
      </div>

      <div className="px-6 mt-4">
        {favoriteTracks.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm">Songs you like will appear here</p>
            <p className="text-white/20 text-xs mt-1">Play some songs and hit the ❤️ button to save them</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {favoriteTracks.map((track, i) => (
              <TrackRow key={track.id} track={track} tracks={favoriteTracks} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search as SearchIcon, X, TrendingUp, Loader2, Play } from 'lucide-react';
import { searchTracks } from '@/lib/musicapi';
import { Track } from '@/data/mockData';
import { TrackRow, TrackCard } from '@/components/cards/Cards';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/lib/store';

const quickSearches = [
  '🔥 Trending Hits', '🎸 Rock Classics', '🎵 K-Pop',
  '🎤 Hip Hop', '💃 Latin', '🎹 Piano', '🎷 Jazz',
  '🌙 Lo-Fi', '💪 Workout', '🎄 Chill Pop',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { setQueue } = usePlayerStore();

  // Load initial top tracks
  useEffect(() => {
    async function init() {
      const top = await searchTracks('top hits popular', 12);
      setTopTracks(top);
    }
    init();
  }, []);

  // Debounced real search via MusicAPI
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setTracks([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await searchTracks(q, 30);
      setTracks(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  const hasResults = tracks.length > 0;
  const showBrowse = !query.trim();

  return (
    <div className="p-6 pb-12 space-y-8">
      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
        <input
          type="text"
          placeholder="Search any song, artist, album..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-10 rounded-full bg-white/[0.08] border border-white/[0.08] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.1] transition-colors"
          autoFocus
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setTracks([]); setHasSearched(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {showBrowse ? (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
            {/* Quick search tags */}
            <section>
              <h2 className="text-lg font-bold mb-3">Quick Search</h2>
              <div className="flex flex-wrap gap-2">
                {quickSearches.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag.replace(/^[^\s]+ /, ''))} // strip emoji
                    className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-sm transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            {/* Top picks */}
            {topTracks.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-bold">Popular Right Now</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {topTracks.map((track, i) => (
                    <TrackCard key={track.id} track={track} tracks={topTracks} index={i} />
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        ) : hasResults ? (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/40">
                {tracks.length} results for &ldquo;{query}&rdquo;
              </p>
              <button
                onClick={() => tracks.length > 0 && setQueue(tracks, 0)}
                className="text-xs text-[#fcd535] hover:text-[#f0b90b] font-medium flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fcd535]/10 hover:bg-[#fcd535]/20 transition-colors"
              >
                <Play className="w-3 h-3" />
                Play all
              </button>
            </div>

            {/* Top Result + Track List */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Top Result Card */}
              {tracks[0] && (
                <div className="md:w-2/5 flex flex-col gap-2">
                  <h3 className="text-xl font-bold">Top result</h3>
                  <div 
                    onClick={() => setQueue(tracks, 0)}
                    className="flex-1 bg-white/[0.03] hover:bg-white/[0.07] p-5 rounded-2xl transition-colors cursor-pointer group relative flex flex-col justify-between min-h-[220px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tracks[0].imageUrl} alt={tracks[0].title} className="w-24 h-24 rounded-lg object-cover mb-4 shadow-lg" />
                    <div>
                      <h1 className="text-3xl font-bold mb-1 truncate">{tracks[0].title}</h1>
                      <p className="text-white/60 mb-3 text-sm">Song • {tracks[0].artist}</p>
                      <span className="inline-block px-3 py-1 rounded-full bg-[#1e2329] text-[#fcd535] text-xs font-semibold">{tracks[0].album}</span>
                    </div>
                    <button className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#fcd535] flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-[0_0_20px_rgba(252,213,53,0.3)]">
                      <Play className="w-6 h-6 fill-[#181a20] text-[#181a20] ml-1" />
                    </button>
                  </div>
                </div>
              )}
              {/* Other Tracks */}
              <div className="md:w-3/5 flex flex-col gap-2">
                <h3 className="text-xl font-bold">Songs</h3>
                <div className="space-y-0.5">
                  {tracks.slice(1, 5).map((track, i) => (
                    <TrackRow key={track.id} track={track} tracks={tracks} index={i + 1} showIndex={false} />
                  ))}
                </div>
              </div>
            </div>

            {/* Track grid for remaining */}
            <h3 className="text-xl font-bold mt-8 mb-4">More from this search</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {tracks.slice(5).map((track, i) => (
                <TrackCard key={track.id} track={track} tracks={tracks} index={i + 5} />
              ))}
            </div>
          </motion.div>
        ) : hasSearched && !isSearching ? (
          <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <SearchIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-white/20 text-xs mt-1">Try different keywords or check your spelling</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

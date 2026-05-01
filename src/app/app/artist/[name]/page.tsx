'use client';

import { use, useEffect, useState } from 'react';
import { searchTracks } from '@/lib/musicapi';
import { Track } from '@/data/mockData';
import { Play, Pause, ChevronLeft, Music, Verified, Users, Info, MoreHorizontal } from 'lucide-react';
import { usePlayerStore, useArtistStore } from '@/lib/store';
import { formatNumber, cn, artistIdToName } from '@/lib/utils';
import { TrackRow } from '@/components/cards/Cards';
import { useRouter } from 'next/navigation';

export default function ArtistPage({ params }: { params: Promise<{ name: string }> }) {
  const router = useRouter();
  const { name } = use(params);
  // Decode the base64 URL slug back to the real artist name
  const decodedName = artistIdToName(name);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { setQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { isFollowing, followArtist, unfollowArtist } = useArtistStore();
  
  const following = isFollowing(decodedName);

  useEffect(() => {
    async function load() {
      setLoading(true);
      document.title = `${decodedName} | VibraX`;
      const results = await searchTracks(decodedName, 20);
      setTracks(results);
      setLoading(false);
    }
    load();
    return () => { document.title = "VibraX"; };
  }, [decodedName]);

  const handlePlayAll = () => {
    if (tracks.length > 0) setQueue(tracks, 0);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fcd535]"></div>
      </div>
    );
  }

  const topTrack = tracks[0];

  return (
    <div className="relative pb-24 bg-gradient-to-b from-[#1a202c] to-[var(--bg-primary)]">
      {/* Artist Header (Spotify Style) */}
      <div className="relative pt-24 px-6 md:px-10 pb-8 overflow-hidden">
        <div className="relative z-20 flex flex-col md:flex-row items-end gap-6 md:gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={topTrack?.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60'} 
            alt={decodedName} 
            className="w-48 h-48 md:w-[232px] md:h-[232px] rounded-full object-cover shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <Verified className="w-6 h-6 text-blue-400 fill-blue-400" />
              <span className="text-sm font-bold uppercase tracking-wider">Verified Artist</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[100px] font-black text-white mb-6 tracking-tighter leading-none notranslate">
              {decodedName}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 bg-black/20 backdrop-blur-md min-h-screen">
        <div className="flex items-center gap-6 mb-10">
          <button
            onClick={() => {
              if (isPlaying && currentTrack?.id === tracks[0]?.id) togglePlay();
              else handlePlayAll();
            }}
            className="w-14 h-14 rounded-full bg-[#fcd535] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(252,213,53,0.3)]"
          >
            {isPlaying && currentTrack?.id === tracks[0]?.id ? (
              <Pause className="w-7 h-7 fill-black text-black" />
            ) : (
              <Play className="w-7 h-7 fill-black text-black ml-1" />
            )}
          </button>
          
          <button 
            onClick={() => {
              if (following) unfollowArtist(decodedName);
              else followArtist({ id: decodedName, name: decodedName, imageUrl: topTrack?.imageUrl || '', followedAt: new Date().toISOString() });
            }}
            className={cn(
              "px-6 py-1.5 rounded-full border text-sm font-bold transition-all",
              following ? "border-white text-white hover:border-white/70" : "border-white/30 text-white hover:border-white"
            )}
          >
            {following ? 'Đang theo dõi' : 'Theo dõi'}
          </button>
          
          <button className="text-white/60 hover:text-white transition-colors">
            <MoreHorizontal className="w-8 h-8" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Popular Tracks List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Phổ biến</h2>
            <div className="space-y-1">
              {tracks.slice(0, 10).map((track, i) => (
                  <TrackRow 
                    key={track.id} 
                    track={track} 
                    tracks={tracks} 
                    index={i} 
                    hideArtist={true}
                  />
              ))}
            </div>
            <button className="text-sm font-bold text-white/60 hover:text-white mt-6 transition-colors">
              Xem thêm
            </button>
          </div>

          {/* About Artist */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6">Giới thiệu</h2>
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-square mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={topTrack?.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745'} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-sm line-clamp-4 text-white/80 leading-relaxed italic">
                  "{decodedName} is a global phenomenon, blending unique sounds with powerful storytelling. With millions of streams across platforms, they continue to push the boundaries of modern music."
                </p>
                <button className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                  <Info className="w-4 h-4" />
                  Read More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, use } from 'react';
import { getTrackById, getLyrics } from '@/lib/musicapi';
import { Track } from '@/data/mockData';
import { Play, Pause, Heart, Music, ChevronLeft, Mic2, UserCircle, Plus, Download } from 'lucide-react';
import { usePlayerStore, useFavoritesStore, usePlaylistStore, useArtistStore } from '@/lib/store';
import { formatTime, cn, downloadTrack, artistUrl } from '@/lib/utils';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackInspectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [track, setTrack] = useState<Track | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lyricsLoading, setLyricsLoading] = useState(true);

  const { currentTrack, isPlaying, togglePlay, setTrack: playTrack } = usePlayerStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { isFollowing, followArtist, unfollowArtist } = useArtistStore();
  const playlists = usePlaylistStore((s) => s.playlists);
  const addTrackToPlaylist = usePlaylistStore((s) => s.addTrackToPlaylist);

  const isActive = currentTrack?.id === track?.id;
  const liked = track ? isFavorite(track.id) : false;
  const following = track ? isFollowing(track.artist) : false;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getTrackById(decodeURIComponent(id));
      setTrack(data);
      if (data) {
        document.title = `${data.title} | VibraX`;
      }
      setLoading(false); // Unblock UI immediately
      
      if (data) {
        setLyricsLoading(true);
        const fetchedLyrics = await getLyrics(data.id, data.title, data.artist, data.duration);
        setLyrics(fetchedLyrics?.plainLyrics || fetchedLyrics?.syncedLyrics || null);
        setLyricsLoading(false);
      } else {
        setLyricsLoading(false);
      }
    }
    load();
    return () => { document.title = "VibraX"; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fcd535]"></div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Music className="w-16 h-16 text-white/20" />
        <h1 className="text-2xl font-bold text-white/60">Track not found</h1>
        <button onClick={() => router.back()} className="text-[#fcd535] hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
      {/* Dynamic Background Banner */}
      <div className="absolute top-0 left-0 right-0 h-[450px] overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[#0b0e11]/80 z-10 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e11]/50 via-transparent to-[#0b0e11] z-20" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={track.imageUrl} alt="" className="w-full h-full object-cover blur-2xl opacity-50 transform scale-125" />
      </div>

      <div className="p-6 md:p-10 pt-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Hero Section (Spotify Style) */}
        <div className="flex flex-col md:flex-row items-end gap-6 md:gap-10 mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={track.imageUrl} 
            alt={track.title} 
            className="w-52 h-52 md:w-64 md:h-64 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-cover" 
          />
          <div className="flex-1">
            <span className="text-sm font-bold text-white/60 uppercase tracking-widest mb-2 block">Song</span>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-4 tracking-tighter leading-tight drop-shadow-lg notranslate">
              {track.title}
            </h1>
            <div className="flex items-center gap-2 text-sm md:text-base font-medium text-white/80 flex-wrap">
              <div className="w-6 h-6 rounded-full bg-[#fcd535] flex items-center justify-center flex-shrink-0">
                <Music className="w-3 h-3 text-black" />
              </div>
              <span className="font-bold text-white notranslate">{track.artist}</span>
              <span className="text-white/40">•</span>
              <span className="notranslate">{track.album}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">{formatTime(track.duration)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={() => isActive ? togglePlay() : playTrack(track)}
            className="w-16 h-16 rounded-full bg-[#fcd535] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(252,213,53,0.3)]"
          >
            {isActive && isPlaying ? (
              <Pause className="w-8 h-8 fill-[#181a20] text-[#181a20]" />
            ) : (
              <Play className="w-8 h-8 fill-[#181a20] text-[#181a20] ml-1" />
            )}
          </button>
          
          <button 
            onClick={() => toggleFavorite(track.id)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <Heart className={cn('w-10 h-10', liked && 'text-[#fcd535] fill-[#fcd535]')} />
          </button>

          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
            {showMenu && (
              <div className="absolute left-0 top-full mt-2 w-56 py-2 rounded-xl bg-[#1e2329] border border-white/10 shadow-2xl z-50">
                <div className="px-4 py-2 text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Add to Playlist</div>
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => { addTrackToPlaylist(pl.id, track); setShowMenu(false); alert(`Added to ${pl.title}`); }}
                    className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.08] flex items-center gap-2 transition-colors"
                  >
                    <Music className="w-4 h-4 text-[#fcd535]" />
                    {pl.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={async () => {
              try {
                let downloadUrl = track.previewUrl;
                if (track.id.match(/^\d+$/) && track.previewUrl?.includes('apple.com')) {
                  const saavnRes = await fetch(`https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(track.title + ' ' + track.artist)}&limit=1`);
                  if (saavnRes.ok) {
                    const saavnData = await saavnRes.json();
                    if (saavnData.data?.results?.[0]?.downloadUrl) {
                      const dl = saavnData.data.results[0].downloadUrl;
                      downloadUrl = dl[dl.length - 1].link || dl[dl.length - 1].url;
                    }
                  }
                }
                if (downloadUrl) {
                  const a = document.createElement('a');
                  a.href = `/api/download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(`${track.artist} - ${track.title}.mp3`)}`;
                  a.download = `${track.artist} - ${track.title}.mp3`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } else {
                  alert('No download available for this track.');
                }
              } catch (e) {
                alert('Lỗi tải xuống.');
              }
            }}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Download className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lyrics Area */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Mic2 className="w-6 h-6 text-[#fcd535]" />
              Lyrics
            </h2>
            <div 
              className="bg-gradient-to-br from-[#1e2329]/80 to-[#1e2329]/40 backdrop-blur-md rounded-2xl p-8 border border-white/[0.04]"
              style={{ minHeight: '300px' }}
            >
              {lyricsLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-white py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#fcd535] mb-4"></div>
                  <p className="animate-pulse font-medium text-white/70">Loading lyrics...</p>
                </div>
              ) : lyrics ? (
                <div className="text-2xl font-bold leading-relaxed tracking-wide text-white">
                  {lyrics.split(/\r?\n/).map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/40 py-12">
                  <Mic2 className="w-12 h-12 mb-4 opacity-20" />
                  <p>Lyrics are not available for this track.</p>
                  <p className="text-sm mt-2 opacity-60">Enjoy the instrumental vibe instead!</p>
                </div>
              )}
            </div>
          </div>

          {/* Artist Profile Area */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold">Artist</h2>
            <div className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors rounded-2xl p-6 border border-white/[0.04] flex flex-col gap-6 cursor-pointer group">
              <div 
                onClick={() => router.push(artistUrl(track.artist))}
                className="flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex-shrink-0 relative group-hover:scale-105 transition-transform shadow-xl">
                  {/* Fallback to track image as artist avatar since API doesn't provide dedicated artist images easily */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={track.imageUrl} alt={track.artist} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-1">Artist Profile</span>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#fcd535] transition-colors">{track.artist}</h3>
                  <p className="text-sm text-white/40">Verified Artist</p>
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (following) unfollowArtist(track.artist);
                  else followArtist({ id: track.artist, name: track.artist, imageUrl: track.imageUrl, followedAt: new Date().toISOString() });
                }}
                className={cn(
                  "w-full py-2.5 rounded-full border font-bold text-sm transition-all",
                  following ? "bg-[#fcd535] text-black border-[#fcd535]" : "border-white/20 hover:border-white hover:bg-white/5 text-white"
                )}
              >
                {following ? 'Following' : 'Follow Artist'}
              </button>
            </div>

            {/* Popular tracks by this artist (Mocked/Fetched) */}
            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.04]">
              <h3 className="text-lg font-bold mb-4">Popular by {track.artist}</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 group/item cursor-pointer">
                    <span className="text-sm text-white/30 w-4">{i}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={track.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover/item:text-[#fcd535] transition-colors">{track.title} {i > 1 ? `(Remix ${i})` : ''}</p>
                      <p className="text-xs text-white/40 truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

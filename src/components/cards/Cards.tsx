'use client';

import { Play, Pause, Heart, MoreHorizontal, Plus, Info, Pin, Edit2, Share2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Track } from '@/data/mockData';
import { usePlayerStore, useFavoritesStore, usePlaylistStore } from '@/lib/store';
import { formatTime, cn, formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

// ===== Track Card (Grid View) =====
export function TrackCard({ track, tracks, index }: { track: Track; tracks?: Track[]; index?: number }) {
  const { currentTrack, isPlaying, setTrack, setQueue, togglePlay } = usePlayerStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const playlists = usePlaylistStore((s) => s.playlists);
  const addTrackToPlaylist = usePlaylistStore((s) => s.addTrackToPlaylist);
  const isActive = currentTrack?.id === track.id;
  const liked = isFavorite(track.id);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else if (tracks && index !== undefined) {
      setQueue(tracks, index);
    } else {
      setTrack(track);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-colors cursor-pointer"
      onClick={() => router.push(`/app/track/${track.id}`)}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
        <button
          className={cn(
            'absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#fcd535] flex items-center justify-center shadow-lg shadow-[#fcd535]/30 transition-all duration-200 z-10',
            isActive && isPlaying
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
          )}
          onClick={(e) => { e.stopPropagation(); handlePlay(); }}
        >
          {isActive && isPlaying ? <Pause className="w-4 h-4 text-[#181a20] fill-[#181a20]" /> : <Play className="w-4 h-4 text-[#181a20] fill-[#181a20] ml-0.5" />}
        </button>
      </div>
      <div className="flex justify-between items-start mt-2 relative">
        <div className="min-w-0 pr-2 flex-1">
          <p className={cn('text-sm font-medium truncate notranslate', isActive && 'text-[#fcd535]')}>{track.title}</p>
          <p className="text-xs text-white/40 truncate mt-0.5 notranslate">{track.artist}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ===== Track Row (List View) =====
export function TrackRow({ track, tracks, index, showIndex = true, playCount, hideArtist }: {
  track: Track; tracks?: Track[]; index: number; showIndex?: boolean; playCount?: number; hideArtist?: boolean;
}) {
  const { currentTrack, isPlaying, setTrack, setQueue, togglePlay } = usePlayerStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const playlists = usePlaylistStore((s) => s.playlists);
  const addTrackToPlaylist = usePlaylistStore((s) => s.addTrackToPlaylist);
  const isActive = currentTrack?.id === track.id;
  const liked = isFavorite(track.id);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else if (tracks) {
      setQueue(tracks, index);
    } else {
      setTrack(track);
    }
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-white/[0.06] cursor-pointer',
        isActive && 'bg-white/[0.06]'
      )}
      onClick={() => router.push(`/app/track/${track.id}`)}
    >
      {/* Index / Play */}
      <div className="w-8 text-center flex-shrink-0">
        <span className={cn('text-sm group-hover:hidden', isActive ? 'text-blue-400' : 'text-white/30')}>
          {showIndex ? index + 1 : '•'}
        </span>
        <button onClick={(e) => { e.stopPropagation(); handlePlay(); }} className="hidden group-hover:block mx-auto text-[#fcd535] hover:text-[#f0b90b] transition-colors">
          {isActive && isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Cover */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={track.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" loading="lazy" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate notranslate', isActive && 'text-blue-400')}>{track.title}</p>
        {!hideArtist && <p className="text-xs text-white/40 truncate notranslate">{track.artist}</p>}
      </div>

      {/* Artist */}
      {!hideArtist && <span className="text-xs text-white/30 w-[180px] truncate hidden lg:block notranslate">{track.artist}</span>}
      
      {/* Play Count (Optional) */}
      {playCount !== undefined && (
        <span className="text-sm text-white/40 w-[150px] text-right hidden md:block flex-shrink-0">
          {formatNumber(playCount)}
        </span>
      )}

      <span className="w-4 hidden lg:block" />

      {/* Duration */}
      <span className="text-xs text-white/30 w-10 text-right flex-shrink-0">{formatTime(track.duration)}</span>
      
      <span className="w-4 hidden lg:block" />
    </div>
  );
}

// ===== Playlist Card (Grid) =====
export function PlaylistCard({ playlist }: { playlist: { id: string; title: string; coverUrl: string; description: string; tracks: Track[]; isPinned?: boolean; shareCode?: string } }) {
  const { setQueue } = usePlayerStore();
  const [hovered, setHovered] = useState(false);
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(playlist.title);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRenameSubmit = (e: React.KeyboardEvent | React.FocusEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (editTitle.trim()) {
      updatePlaylist(playlist.id, { title: editTitle.trim() });
    } else {
      setEditTitle(playlist.title);
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-colors block cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a href={`/app/playlist/${playlist.id}`} className="absolute inset-0 z-0">
          <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
        </a>
        
        {/* Pin Badge */}
        {playlist.isPinned && (
          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#fcd535] flex items-center justify-center shadow-lg z-10">
            <Pin className="w-3 h-3 text-black fill-black" />
          </div>
        )}

        {/* More Menu Toggle */}
        <div className="absolute top-2 right-2 z-20" ref={menuRef}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
            className={cn(
              "w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center backdrop-blur-md transition-all",
              showMenu ? "opacity-100" : "opacity-60 hover:opacity-100"
            )}
          >
            <MoreHorizontal className="w-4 h-4 text-white" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-xl bg-[#1e2329] border border-white/10 shadow-2xl z-50">
              <button
                onClick={(e) => { e.stopPropagation(); updatePlaylist(playlist.id, { isPinned: !playlist.isPinned }); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
              >
                <Pin className="w-4 h-4 text-[#fcd535]" />
                {playlist.isPinned ? 'Unpin Playlist' : 'Pin Playlist'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4 text-blue-400" />
                Rename (Quick)
              </button>
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  navigator.clipboard.writeText(playlist.shareCode || ''); 
                  alert('Share code copied: ' + playlist.shareCode);
                  setShowMenu(false); 
                }}
                className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
              >
                <Share2 className="w-4 h-4 text-green-400" />
                Share Code
              </button>
              <div className="h-px w-full bg-white/10 my-1"></div>
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if(confirm('Delete this playlist?')) deletePlaylist(playlist.id); 
                  setShowMenu(false); 
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {hovered && !showMenu && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#fcd535] flex items-center justify-center shadow-lg shadow-[#fcd535]/30 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (playlist.tracks.length > 0) setQueue(playlist.tracks, 0);
            }}
          >
            <Play className="w-4 h-4 text-[#181a20] fill-[#181a20] ml-0.5" />
          </motion.button>
        )}
      </div>

      {isEditing ? (
        <input 
          type="text" 
          value={editTitle} 
          onChange={e => setEditTitle(e.target.value)} 
          onBlur={handleRenameSubmit}
          onKeyDown={handleRenameSubmit}
          autoFocus
          onClick={e => e.stopPropagation()}
          className="w-full text-sm font-medium bg-[#181a20] border border-[#fcd535] rounded px-2 py-1 outline-none text-[#fcd535]"
        />
      ) : (
        <a href={`/app/playlist/${playlist.id}`} className="block">
          <p className="text-sm font-medium truncate group-hover:text-[#fcd535] transition-colors">{playlist.title}</p>
          <p className="text-xs text-white/40 truncate mt-0.5">{playlist.description || `${playlist.tracks.length} tracks`}</p>
        </a>
      )}
    </motion.div>
  );
}

// ===== Genre Card =====
export function GenreCard({ genre }: { genre: { id: string; name: string; color: string; imageUrl: string } }) {
  return (
    <div
      className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform"
      style={{ backgroundColor: genre.color }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={genre.imageUrl}
        alt=""
        className="absolute bottom-0 right-0 w-1/2 h-1/2 object-cover rounded-tl-xl rotate-12 translate-x-3 translate-y-3 opacity-80"
        loading="lazy"
      />
      <span className="absolute top-4 left-4 text-lg font-bold">{genre.name}</span>
    </div>
  );
}

// ===== Artist Card =====
export function ArtistCard({ artist }: { artist: { id: string; name: string; imageUrl: string; listeners: number } }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="group p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-colors cursor-pointer text-center"
    >
      <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 mx-auto max-w-[160px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <p className="text-sm font-medium truncate">{artist.name}</p>
      <p className="text-xs text-white/40 mt-0.5">{(artist.listeners / 1_000_000).toFixed(1)}M listeners</p>
    </motion.div>
  );
}

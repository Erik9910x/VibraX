'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePlaylistStore, usePlayerStore } from '@/lib/store';
import { TrackRow } from '@/components/cards/Cards';
import { Play, Shuffle, Share2, Copy, Check, Trash2, Edit3, ArrowLeft, Camera, MoreHorizontal, Pin, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo, use, useRef, useEffect } from 'react';

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const playlists = usePlaylistStore((s) => s.playlists);
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist);
  const { setQueue } = usePlayerStore();

  const playlist = useMemo(() => playlists.find((p) => p.id === id), [playlists, id]);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    
    if (playlist) {
      document.title = `${playlist.title} | VibraX`;
    }

    return () => { 
      document.removeEventListener('mousedown', handler);
      document.title = "VibraX";
    };
  }, [playlist]);

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Playlist not found</p>
          <button
            onClick={() => router.push('/app/library')}
            className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-sm transition-colors"
          >
            Go to Library
          </button>
        </div>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) setQueue(playlist.tracks, 0);
  };

  const handleShuffle = () => {
    if (playlist.tracks.length > 0) {
      const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
      setQueue(shuffled, 0);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(playlist.shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setEditTitle(playlist.title);
    setEditDesc(playlist.description);
    setEditCoverUrl(playlist.coverUrl);
    setEditing(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    updatePlaylist(playlist.id, { 
      title: editTitle.trim() || playlist.title, 
      description: editDesc,
      coverUrl: editCoverUrl.trim() || playlist.coverUrl
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this playlist? This cannot be undone.')) {
      deletePlaylist(playlist.id);
      router.push('/app/library');
    }
  };

  const totalDuration = playlist.tracks.reduce((acc, t) => acc + t.duration, 0);
  const mins = Math.floor(totalDuration / 60);

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="relative p-8 pb-6 bg-gradient-to-b from-[#fcd535]/15 via-[#fcd535]/5 to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end gap-6"
        >
          {/* Cover */}
          <div className="w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 shadow-2xl relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={playlist.coverUrl} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">Playlist</p>
            {editing ? (
              <div className="space-y-2 mb-2 w-full max-w-md">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1 focus:outline-none focus:border-[#fcd535]/50 w-full"
                  autoFocus
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 text-sm bg-white/[0.06] border border-white/10 rounded-lg cursor-pointer hover:bg-white/[0.1] transition-colors flex-shrink-0">
                    <Camera className="w-4 h-4 text-[#fcd535]" />
                    <span className="text-white/80 font-medium">Upload Cover</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  {editCoverUrl !== playlist.coverUrl && (
                    <span className="text-xs text-green-400">Image selected</span>
                  )}
                </div>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="text-sm bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#fcd535]/50 w-full resize-none"
                  placeholder="Add a description..."
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="px-4 py-1.5 rounded-full bg-[#fcd535] text-black text-xs font-medium">
                    Save
                  </button>
                  <button onClick={() => setEditing(false)} className="px-4 py-1.5 rounded-full bg-white/[0.06] text-xs text-white/60">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-2 truncate">{playlist.title}</h1>
                {playlist.description && <p className="text-sm text-white/50 mb-2 truncate">{playlist.description}</p>}
              </>
            )}
            <p className="text-xs text-white/30">
              {playlist.tracks.length} songs • {mins} min • Code: <span className="text-[#fcd535] font-mono">{playlist.shareCode}</span>
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            className="w-12 h-12 rounded-full bg-[#fcd535] hover:bg-[#f0b90b] disabled:opacity-40 flex items-center justify-center shadow-lg shadow-[#fcd535]/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 text-black ml-0.5 fill-black" />
          </button>
          <button onClick={handleShuffle} className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors">
            <Shuffle className="w-4 h-4 text-white/60" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-white/60" />
            </button>
            
            {showMenu && (
              <div className="absolute left-0 top-full mt-2 w-48 py-1 rounded-xl bg-[#1e2329] border border-white/10 shadow-2xl z-50">
                <button
                  onClick={() => { updatePlaylist(playlist.id, { isPinned: !playlist.isPinned }); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
                >
                  <Pin className="w-4 h-4 text-[#fcd535]" />
                  {playlist.isPinned ? 'Unpin Playlist' : 'Pin Playlist'}
                </button>
                <button
                  onClick={() => { handleStartEdit(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4 text-blue-400" />
                  Rename (Quick)
                </button>
                <button
                  onClick={() => { setShowShareModal(true); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-green-400" />
                  Share Playlist
                </button>
                {playlist.userId !== 'system' && (
                  <>
                    <div className="h-px w-full bg-white/10 my-1"></div>
                    <button
                      onClick={() => { handleDelete(); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="px-6 mt-4">
        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-2 text-xs text-white/30 uppercase tracking-wider border-b border-white/[0.06] mb-2">
          <span className="w-8 text-center">#</span>
          <span className="w-10" />
          <span className="flex-1">Title</span>
          <span className="w-[180px] hidden lg:block">Artist</span>
          <span className="w-4" />
          <span className="w-10 text-right">Time</span>
          <span className="w-4" />
        </div>

        {playlist.tracks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/40 text-sm">This playlist is empty</p>
            <p className="text-white/20 text-xs mt-1">Search for tracks and add them here</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {playlist.tracks.map((track, i) => (
              <TrackRow key={track.id} track={track} tracks={playlist.tracks} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-2xl bg-[#132D46] border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">Share Playlist</h3>
            <p className="text-sm text-white/50 mb-4">Share this code with friends to let them access your playlist.</p>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.06] border border-white/[0.08] mb-3">
              <span className="text-lg font-mono font-bold text-blue-400 flex-1 text-center tracking-widest">
                {playlist.shareCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-white/[0.08] transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/40" />}
              </button>
            </div>

            <p className="text-xs text-white/30 text-center">
              {copied ? 'Copied to clipboard!' : 'Click to copy the share code'}
            </p>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-sm font-medium transition-colors"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

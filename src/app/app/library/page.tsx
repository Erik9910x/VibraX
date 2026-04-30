'use client';

import { usePlaylistStore, useHistoryStore } from '@/lib/store';
import { PlaylistCard } from '@/components/cards/Cards';
import { Plus, Library as LibraryIcon, Clock, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { TrackCard } from '@/components/cards/Cards';
import { mockPlaylists } from '@/data/mockData';

export default function LibraryPage() {
  const playlists = usePlaylistStore((s) => s.playlists);
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
  const importPlaylist = usePlaylistStore((s) => s.importPlaylist);
  const recentlyPlayed = useHistoryStore((s) => s.recentlyPlayed);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [importCode, setImportCode] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createPlaylist(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    setShowModal(false);
  };

  const handleImport = () => {
    if (!importCode.trim()) return;
    const pl = mockPlaylists.find(p => p.shareCode === importCode.trim().toUpperCase());
    if (pl) {
      importPlaylist(pl);
      setImportCode('');
      setShowImportModal(false);
      alert('Playlist imported successfully!');
    } else {
      alert('Invalid or unknown share code.');
    }
  };

  return (
    <div className="p-6 pb-12 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <LibraryIcon className="w-6 h-6 text-white/40" />
          <h1 className="text-2xl font-bold">Your Library</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.12] transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </button>
        </div>
      </motion.div>

      {/* Playlists */}
      <section>
        <h2 className="text-lg font-bold mb-4">Your Playlists</h2>
        {playlists.length === 0 ? (
          <div className="text-center py-16">
            <LibraryIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 mb-4">No playlists yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-sm font-medium transition-colors"
            >
              Create your first playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {playlists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-white/40" />
            <h2 className="text-lg font-bold">Recently Played</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {recentlyPlayed.slice(0, 12).map((track, i) => (
              <TrackCard key={track.id} track={track} tracks={recentlyPlayed.slice(0, 12)} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Create Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-2xl bg-[#132D46] border border-white/10 shadow-2xl"
          >
            <h3 className="text-lg font-bold mb-4">Create New Playlist</h3>
            <input
              type="text"
              placeholder="Playlist name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm placeholder:text-white/30 focus:outline-none focus:border-[#fcd535]/50 mb-3"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm placeholder:text-white/30 focus:outline-none focus:border-[#fcd535]/50 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-full text-sm text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="px-6 py-2 rounded-full bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Import Playlist Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-2xl bg-[#132D46] border border-white/10 shadow-2xl"
          >
            <h3 className="text-lg font-bold mb-2">Import from Supabase Cloud</h3>
            <p className="text-sm text-white/50 mb-4">Enter a Supabase Share Code (e.g. VIBRA-CHILL42) to import a preset playlist.</p>
            <input
              type="text"
              placeholder="Supabase Code..."
              value={importCode}
              onChange={(e) => setImportCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm font-mono placeholder:text-white/30 focus:outline-none focus:border-[#fcd535]/50 mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleImport()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-full text-sm text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importCode.trim()}
                className="px-6 py-2 rounded-full bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                Import
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

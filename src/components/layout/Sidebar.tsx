'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, Heart, User, Plus, Music, Menu, X, MoreHorizontal, Pin, Edit2, Share2, Trash2 } from 'lucide-react';
import { usePlaylistStore, useArtistStore } from '@/lib/store';
import { cn, artistUrl, artistNameToId } from '@/lib/utils';
import { useState, createContext, useContext, useRef, useEffect } from 'react';

export const SidebarContext = createContext<{ collapsed: boolean; setCollapsed: (v: boolean) => void }>({ 
  collapsed: false, setCollapsed: () => {} 
});

export function useSidebar() {
  return useContext(SidebarContext);
}

const navItems = [
  { href: '/app', icon: Home, label: 'Home' },
  { href: '/app/search', icon: Search, label: 'Search' },
  { href: '/app/library', icon: Library, label: 'Your Library' },
  { href: '/app/favorites', icon: Heart, label: 'Favorites' },
  { href: '/app/profile', icon: User, label: 'Profile' },
];

function SidebarPlaylistItem({ playlist, pathname, onToggle }: any) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(playlist.title);
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist);
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);

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

  const isActive = pathname === `/app/playlist/${playlist.id}`;

  return (
    <div 
      className={cn(
        "group relative flex items-center pr-2 rounded-lg transition-all duration-200",
        isActive ? "bg-white/10" : "hover:bg-white/[0.04]"
      )}
    >
      {isEditing ? (
        <div className="flex items-center gap-3 px-3 py-2 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={playlist.coverUrl} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameSubmit}
            autoFocus
            className="w-full text-sm font-medium bg-[#181a20] border border-[#fcd535] rounded px-2 py-1 outline-none text-[#fcd535]"
          />
        </div>
      ) : (
        <Link
          href={`/app/playlist/${playlist.id}`}
          onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
          className={cn(
            'flex items-center gap-3 px-3 py-2 flex-1 min-w-0 rounded-lg',
            isActive ? 'text-white' : 'text-white/50 hover:text-white'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={playlist.coverUrl} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className={cn("text-sm truncate", playlist.isPinned && "text-[#fcd535]")}>{playlist.title}</p>
            <p className="text-xs text-white/30 truncate">{playlist.tracks.length} tracks</p>
          </div>
        </Link>
      )}

      {/* More Menu */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center transition-all",
            showMenu ? "opacity-100 bg-white/10" : "opacity-0 group-hover:opacity-100 hover:bg-white/10"
          )}
        >
          <MoreHorizontal className="w-4 h-4 text-white/60 hover:text-white" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-xl bg-[#1e2329] border border-white/10 shadow-2xl z-50">
            <button
              onClick={() => { updatePlaylist(playlist.id, { isPinned: !playlist.isPinned }); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
            >
              <Pin className="w-4 h-4 text-[#fcd535]" />
              {playlist.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={() => { setIsEditing(true); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4 text-blue-400" />
              Rename (Quick)
            </button>
            <button
              onClick={() => { 
                navigator.clipboard.writeText(playlist.shareCode || ''); 
                alert('Share code copied: ' + playlist.shareCode);
                setShowMenu(false); 
              }}
              className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-green-400" />
              Share
            </button>
            <div className="h-px w-full bg-white/10 my-1"></div>
            <button
              onClick={() => { 
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
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const playlists = usePlaylistStore((s) => s.playlists);
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
  const followedArtists = useArtistStore((s) => s.followedArtists);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-[calc(100vh-var(--player-height))] z-40 flex flex-col transition-all duration-300 ease-out',
          'bg-[var(--bg-secondary)] border-r border-[var(--border)]',
          // Mobile: hidden by default, shown as overlay
          'max-lg:-translate-x-full max-lg:w-[280px]',
          !collapsed && 'max-lg:translate-x-0',
          // Desktop: always visible
          'lg:translate-x-0 lg:w-[280px]'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 flex-shrink-0">
          <Link href="/app" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#fcd535] flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-[#181a20]" />
            </div>
            <span className="text-lg font-bold text-[#fcd535]">
              VibraX
            </span>
          </Link>
          <button onClick={onToggle} className="lg:hidden p-1">
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Main Nav */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = item.href === '/app' 
              ? pathname === '/app'
              : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-[#fcd535]')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-5 my-4 h-px bg-white/[0.06]" />

        {/* Save Preset Button */}
        <div className="px-5 mb-4">
          <button 
            onClick={async () => {
              try {
                const { savePreset } = await import('@/lib/supabase');
                const { useFavoritesStore, usePlaylistStore, useArtistStore } = await import('@/lib/store');
                const state = {
                  favorites: useFavoritesStore.getState().favoriteIds,
                  playlists: usePlaylistStore.getState().playlists,
                  artists: useArtistStore.getState().followedArtists,
                };
                
                const code = await savePreset(state);
                
                // Copy to clipboard immediately and show alert
                try {
                  await navigator.clipboard.writeText(code);
                  alert(`Đã copy mã Preset ${code} vào clipboard!\nHãy lưu mã này lại để khôi phục (code expire vĩnh viễn).`);
                } catch(e) {
                  prompt('Copy mã Preset này để khôi phục sau:', code);
                }
              } catch (err: any) {
                alert(err.message || 'Có lỗi xảy ra khi lưu Preset.');
              }
            }}
            className="w-full py-2.5 rounded-lg bg-[#fcd535] text-black text-xs font-black uppercase tracking-widest hover:bg-[#f0b90b] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(252,213,53,0.3)] flex items-center justify-center gap-2 notranslate"
          >
            Lưu Preset
          </button>
        </div>

        {/* Playlists & Artists Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 no-scrollbar pb-10">
          {/* Playlists */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-3 mb-3">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Playlists</span>
              <button
                onClick={() => createPlaylist('New Playlist')}
                className="w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Create playlist"
              >
                <Plus className="w-3.5 h-3.5 text-white/60" />
              </button>
            </div>
            <div className="space-y-0.5">
              {playlists.map((playlist) => (
                <SidebarPlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  pathname={pathname}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>

          {/* Following Artists */}
          {followedArtists.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 mb-3">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Following Artists</span>
              </div>
              <div className="space-y-0.5">
                {followedArtists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={artistUrl(artist.name)}
                    onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                      pathname === `/app/artist/${artistNameToId(artist.name)}`
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={artist.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{artist.name}</p>
                      <p className="text-xs text-white/30 truncate">Artist</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

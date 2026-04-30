import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track, Playlist } from '@/data/mockData';

// ===== PLAYER STORE =====
interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  
  setTrack: (track: Track) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setProgress: (p: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  volume: 70,
  progress: 0,
  duration: 0,
  isMuted: false,
  isShuffled: false,
  repeatMode: 'off',

  setTrack: (track) => {
    set({ currentTrack: track, isPlaying: true, progress: 0, duration: track.duration });
    // Add to history
    useHistoryStore.getState().addToHistory(track);
  },

  setQueue: (tracks, startIndex = 0) => {
    const track = tracks[startIndex];
    set({ 
      queue: tracks, 
      queueIndex: startIndex, 
      currentTrack: track, 
      isPlaying: true, 
      progress: 0,
      duration: track?.duration || 0,
    });
    if (track) useHistoryStore.getState().addToHistory(track);
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { queue, queueIndex, repeatMode } = get();
    if (queue.length === 0) return;
    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') nextIndex = 0;
      else { set({ isPlaying: false }); return; }
    }
    const track = queue[nextIndex];
    set({ queueIndex: nextIndex, currentTrack: track, progress: 0, duration: track.duration, isPlaying: true });
    useHistoryStore.getState().addToHistory(track);
  },

  previous: () => {
    const { queue, queueIndex, progress } = get();
    if (progress > 3) { set({ progress: 0 }); return; }
    if (queue.length === 0) return;
    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const track = queue[prevIndex];
    set({ queueIndex: prevIndex, currentTrack: track, progress: 0, duration: track.duration, isPlaying: true });
  },

  setVolume: (v) => set({ volume: v, isMuted: v === 0 }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setProgress: (p) => set({ progress: p }),
  toggleShuffle: () => set((s) => ({ isShuffled: !s.isShuffled })),
  toggleRepeat: () => set((s) => ({
    repeatMode: s.repeatMode === 'off' ? 'all' : s.repeatMode === 'all' ? 'one' : 'off',
  })),
}));

// ===== PLAYLIST STORE =====
interface PlaylistState {
  playlists: Playlist[];
  createPlaylist: (title: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  reorderTracks: (playlistId: string, fromIndex: number, toIndex: number) => void;
  getPlaylistByCode: (code: string) => Playlist | undefined;
  initDefaults: (defaults: Playlist[]) => void;
  importPlaylist: (playlist: Playlist) => void;
}

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'VIBRA-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function generateId(): string {
  return 'pl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],
      _defaultsLoaded: false,

      initDefaults: (defaults) => {
        const state = get() as any;
        if (!state._defaultsLoaded && state.playlists.length === 0) {
          set({ playlists: defaults, _defaultsLoaded: true } as any);
        }
      },

      importPlaylist: (playlist) => {
        set((s) => ({
          playlists: [playlist, ...s.playlists.filter((p) => p.id !== playlist.id)]
        }));
      },

      createPlaylist: (title, description = '') => {
        const newPlaylist: Playlist = {
          id: generateId(),
          title,
          description,
          coverUrl: `https://picsum.photos/seed/${Date.now()}/300/300`,
          tracks: [],
          createdAt: new Date().toISOString(),
          shareCode: generateShareCode(),
          userId: 'local',
        };
        set((s) => ({ playlists: [newPlaylist, ...s.playlists] }));
        return newPlaylist;
      },

      deletePlaylist: (id) => set((s) => ({ playlists: s.playlists.filter(p => p.id !== id) })),

      addTrackToPlaylist: (playlistId, track) => {
        set((s) => ({
          playlists: s.playlists.map(p => {
            if (p.id !== playlistId) return p;
            if (p.tracks.some(t => t.id === track.id)) return p;
            return { ...p, tracks: [...p.tracks, track] };
          }),
        }));
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        set((s) => ({
          playlists: s.playlists.map(p =>
            p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p
          ),
        }));
      },

      updatePlaylist: (id, updates) => {
        set((s) => ({
          playlists: s.playlists.map(p => p.id === id ? { ...p, ...updates } : p),
        }));
      },

      reorderTracks: (playlistId, fromIndex, toIndex) => {
        set((s) => ({
          playlists: s.playlists.map(p => {
            if (p.id !== playlistId) return p;
            const tracks = [...p.tracks];
            const [removed] = tracks.splice(fromIndex, 1);
            tracks.splice(toIndex, 0, removed);
            return { ...p, tracks };
          }),
        }));
      },

      getPlaylistByCode: (code) => {
        return get().playlists.find(p => p.shareCode.toLowerCase() === code.toLowerCase());
      },
    }),
    { name: 'vibrax-playlists' }
  )
);

// ===== FAVORITES STORE =====
interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (trackId) => {
        set((s) => ({
          favoriteIds: s.favoriteIds.includes(trackId)
            ? s.favoriteIds.filter(id => id !== trackId)
            : [...s.favoriteIds, trackId],
        }));
      },
      isFavorite: (trackId) => get().favoriteIds.includes(trackId),
    }),
    { name: 'vibrax-favorites' }
  )
);

// ===== HISTORY STORE =====
interface HistoryState {
  recentlyPlayed: Track[];
  addToHistory: (track: Track) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      recentlyPlayed: [],
      addToHistory: (track) => {
        set((s) => {
          const filtered = s.recentlyPlayed.filter(t => t.id !== track.id);
          return { recentlyPlayed: [track, ...filtered].slice(0, 50) };
        });
      },
      clearHistory: () => set({ recentlyPlayed: [] }),
    }),
    { name: 'vibrax-history' }
  )
);

// ===== SEARCH STORE =====
interface SearchState {
  query: string;
  results: Track[];
  isLoading: boolean;
  setQuery: (q: string) => void;
  setResults: (tracks: Track[]) => void;
  setLoading: (l: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  isLoading: false,
  setQuery: (q) => set({ query: q }),
  setResults: (tracks) => set({ results: tracks }),
  setLoading: (l) => set({ isLoading: l }),
}));

// ===== ARTIST STORE =====
interface FollowedArtist {
  id: string;
  name: string;
  imageUrl: string;
  followedAt: string;
}

interface ArtistStoreState {
  followedArtists: FollowedArtist[];
  followArtist: (artist: FollowedArtist) => void;
  unfollowArtist: (artistId: string) => void;
  isFollowing: (artistId: string) => boolean;
}

export const useArtistStore = create<ArtistStoreState>()(
  persist(
    (set, get) => ({
      followedArtists: [],
      followArtist: (artist) => {
        set((s) => ({
          followedArtists: [artist, ...s.followedArtists.filter(a => a.id !== artist.id)]
        }));
      },
      unfollowArtist: (artistId) => {
        set((s) => ({
          followedArtists: s.followedArtists.filter(a => a.id !== artistId)
        }));
      },
      isFollowing: (artistId) => get().followedArtists.some(a => a.id === artistId),
    }),
    { name: 'vibrax-artists' }
  )
);


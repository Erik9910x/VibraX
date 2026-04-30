export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  imageUrl: string;
  previewUrl: string | null;
  source: 'spotify' | 'soundcloud' | 'mock';
  externalUrl: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  createdAt: string;
  shareCode: string;
  userId: string;
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  genres: string[];
  listeners: number;
}

export interface Genre {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
}

// Default empty playlists — user will populate with real tracks from search/discover
export const mockPlaylists: Playlist[] = [
  {
    id: 'pl1',
    title: 'Chill Vibes 🌙',
    description: 'Perfect for late night sessions',
    coverUrl: 'https://e-cdns-images.dzcdn.net/images/misc/db7a604d9e7634a67d45cfc86b25e3de/500x500-000000-80-0-0.jpg',
    tracks: [],
    createdAt: '2026-04-01T00:00:00Z',
    shareCode: 'VIBRA-CHILL42',
    userId: 'system',
  },
  {
    id: 'pl2',
    title: 'Workout Energy 🔥',
    description: 'Get pumped and stay motivated',
    coverUrl: 'https://e-cdns-images.dzcdn.net/images/misc/a1a66dacaa0654de9c5c3c232e98a245/500x500-000000-80-0-0.jpg',
    tracks: [],
    createdAt: '2026-04-05T00:00:00Z',
    shareCode: 'VIBRA-PUMP88',
    userId: 'system',
  },
  {
    id: 'pl3',
    title: 'Sad Hours 💔',
    description: 'When you need to feel the feels',
    coverUrl: 'https://e-cdns-images.dzcdn.net/images/misc/1e621857b498e81aa1e038935e1af614/500x500-000000-80-0-0.jpg',
    tracks: [],
    createdAt: '2026-04-10T00:00:00Z',
    shareCode: 'VIBRA-FEEL77',
    userId: 'system',
  },
];

// No more fake mock tracks — all music comes from Deezer API now
export const mockTracks: Track[] = [];
export const mockArtists: Artist[] = [];
export const mockGenres: Genre[] = [];

export const moodCategories = [
  { id: 'mood1', name: 'Chill Nights', emoji: '🌙', color: 'from-indigo-600 to-blue-800', trackIds: [] as string[] },
  { id: 'mood2', name: 'Workout Energy', emoji: '🔥', color: 'from-red-600 to-orange-600', trackIds: [] as string[] },
  { id: 'mood3', name: 'Sad Hours', emoji: '💔', color: 'from-purple-700 to-indigo-900', trackIds: [] as string[] },
  { id: 'mood4', name: 'Party Mode', emoji: '🎉', color: 'from-yellow-500 to-pink-500', trackIds: [] as string[] },
  { id: 'mood5', name: 'Focus Flow', emoji: '🧠', color: 'from-teal-600 to-cyan-700', trackIds: [] as string[] },
  { id: 'mood6', name: 'Road Trip', emoji: '🚗', color: 'from-green-600 to-emerald-700', trackIds: [] as string[] },
];

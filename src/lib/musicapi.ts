// JioSaavn API Client for FULL length streaming
// Uses unofficial JioSaavn wrapper API

import { Track } from '@/data/mockData';

const SAAVN_BASE = 'https://jiosaavn-api-privatecvc2.vercel.app';

// ========== Response types from JioSaavn ==========
interface SaavnImage {
  quality: string;
  link: string;
}

interface SaavnDownloadUrl {
  quality: string;
  link: string;
}

interface SaavnTrackData {
  id: string;
  name: string;
  primaryArtists: string;
  album: { name: string; url: string };
  duration: string; // in seconds
  image: SaavnImage[];
  downloadUrl: SaavnDownloadUrl[];
  url: string;
}

interface SaavnSearchResponse {
  status: string;
  data: {
    results: SaavnTrackData[];
  };
}

// ========== Convert to app Track format ==========
function apiResultToTrack(d: SaavnTrackData): Track | null {
  if (!d || !d.name) return null;
  
  // get 320kbps or the highest quality 
  const audioObj = d.downloadUrl?.find(x => x.quality === '320kbps') || d.downloadUrl?.[d.downloadUrl.length - 1];
  const coverObj = d.image?.find(x => x.quality === '500x500') || d.image?.[d.image.length - 1];

  return {
    id: `saavn_${d.id}`,
    title: d.name.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&"),
    artist: d.primaryArtists.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&"),
    album: d.album?.name?.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&") || 'Unknown Album',
    duration: parseInt(d.duration) || 30, // seconds
    imageUrl: coverObj?.link || 'https://placehold.co/300x300/1a1a2e/3B82F6?text=♪',
    previewUrl: audioObj?.link || null, // FULL LENGTH AUDIO NOW
    source: 'spotify', // keeping 'spotify' label for ui purposes
    externalUrl: d.url || '#',
  };
}

// ========== Search tracks (Upgraded to Global iTunes API for massive data) ==========
export async function searchTracks(query: string, limit = 25): Promise<Track[]> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`);
    if (!res.ok) {
      console.error('Search failed:', res.status);
      return [];
    }
    const json = await res.json();
    
    if (!json.results || !Array.isArray(json.results)) {
      return [];
    }
    
    return json.results.map((r: any) => {
      // Hack to get 600x600 high-res image instead of 100x100
      const highResImage = r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : 'https://placehold.co/600x600/1a1a2e/3B82F6?text=♪';
      
      return {
        id: r.trackId.toString(),
        title: r.trackName,
        artist: r.artistName,
        album: r.collectionName || 'Unknown Album',
        duration: Math.floor((r.trackTimeMillis || 0) / 1000), // convert to seconds
        imageUrl: highResImage,
        previewUrl: r.previewUrl || null,
        source: 'spotify', // keeping UI tags unchanged
        externalUrl: r.trackViewUrl || '#',
      };
    });
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
}

// ========== Search popular tracks for homepage ==========
export async function getPopularTracks(queries: string[]): Promise<Track[]> {
  const allTracks: Track[] = [];
  const seen = new Set<string>();

  // Fetch from global hit queries
  const results = await Promise.allSettled(
    queries.map(q => searchTracks(q, 3))
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const track of result.value) {
        const key = `${track.title.toLowerCase()}_${track.artist.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          allTracks.push(track);
        }
      }
    }
  }

  // Shuffle to make it look dynamic
  return allTracks.sort(() => Math.random() - 0.5);
}

// ========== Get trending tracks ==========
// Fetches the current Spotify Global Top 10 popular hits.
export async function getTrendingTracks(): Promise<Track[]> {
  return getPopularTracks([
    'Too Sweet Hozier',
    'Espresso Sabrina Carpenter',
    'Beautiful Things Benson Boone',
    'Lose Control Teddy Swims',
    'Birds of a Feather Billie Eilish',
    'Good Luck Babe Chappell Roan',
    'Please Please Please Sabrina Carpenter',
    'A Bar Song Tipsy Shaboozey',
    'Not Like Us Kendrick Lamar',
    'I Had Some Help Post Malone'
  ]);
}

// ========== Get mood-based tracks ==========
export async function getMoodTracks(moodQuery: string): Promise<Track[]> {
  return searchTracks(moodQuery, 10);
}

// ========== Get track by ID (Updated for iTunes & Saavn support) ==========
export async function getTrackById(id: string): Promise<Track | null> {
  try {
    // 1. Try iTunes Lookup first if ID is numeric
    if (/^\d+$/.test(id)) {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results[0]) {
          const r = data.results[0];
          const highResImage = r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : 'https://placehold.co/600x600/1a1a2e/3B82F6?text=♪';
          
          return {
            id: r.trackId.toString(),
            title: r.trackName,
            artist: r.artistName,
            album: r.collectionName || 'Unknown Album',
            duration: Math.floor((r.trackTimeMillis || 0) / 1000),
            imageUrl: highResImage,
            previewUrl: r.previewUrl || null,
            source: 'spotify',
            externalUrl: r.trackViewUrl || '#',
          };
        }
      }
    }

    // 2. Try JioSaavn
    const cleanId = id.replace('saavn_', '');
    const res = await fetch(`${SAAVN_BASE}/songs?id=${cleanId}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.data && data.data[0]) {
      return apiResultToTrack(data.data[0]);
    }
    return null;
  } catch (error) {
    console.error('Track fetch error:', error);
    return null;
  }
}

// ========== Get track lyrics ==========
export async function getLyrics(id: string, title: string, artist: string, duration?: number): Promise<{ plainLyrics?: string, syncedLyrics?: string }> {
  const cleanArtist = artist.split(',')[0].split('&')[0].split(' x ')[0].split('feat')[0].trim();
  let cleanTitle = title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/\s*-\s*(Remix|Mix|Edit|Version|Remaster|Live|Acoustic|Radio|Original|Deluxe|Bonus|Extended|Sped Up|Slowed).*/gi, '').trim();
  if (cleanTitle.includes(' - ')) cleanTitle = cleanTitle.split(' - ')[0].trim();
  const cleanId = id.replace('saavn_', '');

  try {
    // 1. Use the server-side /api/lyrics proxy (has proper User-Agent for Lrclib)
    const params = new URLSearchParams({ track: cleanTitle, artist: cleanArtist });
    if (duration) params.set('duration', String(duration));
    
    const proxyRes = await fetch(`/api/lyrics?${params.toString()}`);
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && (data.syncedLyrics || data.plainLyrics)) {
        return { syncedLyrics: data.syncedLyrics || undefined, plainLyrics: data.plainLyrics || undefined };
      }
    }
  } catch (e) {
    console.warn('Proxy lyrics failed:', e);
  }

  try {
    // 2. Fallback: JioSaavn lyrics
    const saavnRes = await fetch(`${SAAVN_BASE}/lyrics?id=${cleanId}`);
    if (saavnRes.ok) {
      const d = await saavnRes.json();
      if (d?.data?.lyrics) return { plainLyrics: d.data.lyrics.replace(/<br\s*\/?>/gi, '\n') };
    }
  } catch (e) {
    console.warn('Saavn lyrics failed:', e);
  }

  // 3. Always return something
  return { plainLyrics: `Lyrics for "${title}" by ${artist}\n\n♪ Instrumental / Lyrics not yet available in database ♪\n\nTip: Lyrics are crowdsourced.\nThis track may not have been submitted yet.` };
}

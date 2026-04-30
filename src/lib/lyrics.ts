// Lyrics client (LRCLIB) + Embed player (MusicAPI)

export interface LyricsData {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

export interface ParsedLyricLine {
  time: number; // seconds
  text: string;
}

// Fetch lyrics for a track
export async function getLyrics(
  trackName: string,
  artistName: string,
  albumName?: string,
  duration?: number
): Promise<LyricsData | null> {
  try {
    let url = `/api/lyrics?track=${encodeURIComponent(trackName)}&artist=${encodeURIComponent(artistName)}`;
    if (albumName) url += `&album=${encodeURIComponent(albumName)}`;
    if (duration) url += `&duration=${duration}`;

    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Parse synced lyrics (LRC format) into timestamped lines
// Format: [mm:ss.xx] Lyric text
export function parseSyncedLyrics(syncedLyrics: string): ParsedLyricLine[] {
  const lines: ParsedLyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/;

  for (const line of syncedLyrics.split('\n')) {
    const match = regex.exec(line.trim());
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const ms = parseInt(match[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + ms / 1000;
      const text = match[4].trim();
      if (text) {
        lines.push({ time, text });
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

// Get embed player iframe HTML for a track URL
export async function getEmbedPlayer(trackUrl: string): Promise<{ html: string; sizes: string[] } | null> {
  try {
    const res = await fetch('/api/music/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: trackUrl }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

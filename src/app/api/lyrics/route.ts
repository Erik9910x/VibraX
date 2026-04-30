import { NextRequest, NextResponse } from 'next/server';

// LRCLIB proxy — free synced lyrics, no auth required
// Server-side to include proper User-Agent header (Lrclib BLOCKS browser requests without it)

const UA = 'VibraX/1.0 (https://vibrax.app)';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackName = searchParams.get('track');
  const artistName = searchParams.get('artist');
  const albumName = searchParams.get('album');
  const duration = searchParams.get('duration');

  if (!trackName || !artistName) {
    return NextResponse.json({ error: 'Missing track or artist' }, { status: 400 });
  }

  try {
    // === Stage 1: Exact match (if album + duration provided) ===
    if (albumName && duration) {
      const exactUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}&album_name=${encodeURIComponent(albumName)}&duration=${duration}`;
      const exactRes = await fetch(exactUrl, { headers: { 'User-Agent': UA } });
      if (exactRes.ok) {
        const data = await exactRes.json();
        if (data && (data.syncedLyrics || data.plainLyrics)) {
          return NextResponse.json(data);
        }
      }
    }

    // === Stage 2: Exact get without album ===
    const getUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
    const getRes = await fetch(getUrl, { headers: { 'User-Agent': UA } });
    if (getRes.ok) {
      const data = await getRes.json();
      if (data && (data.syncedLyrics || data.plainLyrics)) {
        return NextResponse.json(data);
      }
    }

    // === Stage 3: Strict search ===
    const searchUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': UA } });
    if (searchRes.ok) {
      const results = await searchRes.json();
      if (Array.isArray(results) && results.length > 0) {
        const synced = results.find((r: any) => r.syncedLyrics);
        if (synced) return NextResponse.json(synced);
        if (results[0].plainLyrics) return NextResponse.json(results[0]);
      }
    }

    // === Stage 4: Fuzzy search (query string, title only) ===
    const fuzzyUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(trackName)}`;
    const fuzzyRes = await fetch(fuzzyUrl, { headers: { 'User-Agent': UA } });
    if (fuzzyRes.ok) {
      const results = await fuzzyRes.json();
      if (Array.isArray(results) && results.length > 0) {
        // Prefer results matching the artist
        const artistLower = artistName.toLowerCase();
        const matchedSynced = results.find((r: any) => 
          r.syncedLyrics && r.artistName?.toLowerCase().includes(artistLower)
        );
        if (matchedSynced) return NextResponse.json(matchedSynced);

        // Any synced result
        const anySynced = results.find((r: any) => r.syncedLyrics);
        if (anySynced) return NextResponse.json(anySynced);

        // Any plain result  
        const anyPlain = results.find((r: any) => r.plainLyrics);
        if (anyPlain) return NextResponse.json(anyPlain);
      }
    }

    return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
  } catch (error) {
    console.error('LRCLIB error:', error);
    return NextResponse.json({ error: 'Failed to fetch lyrics' }, { status: 500 });
  }
}

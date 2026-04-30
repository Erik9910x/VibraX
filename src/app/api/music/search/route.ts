import { NextRequest, NextResponse } from 'next/server';

// MusicAPI.com Search Proxy — uses Backend auth (Basic) to avoid rate limits
// Returns REAL tracks from Deezer with preview URLs
const CLIENT_ID = process.env.MUSICAPI_CLIENT_ID!;
const CLIENT_SECRET = process.env.MUSICAPI_CLIENT_SECRET!;
const BASIC_AUTH = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const API_BASE = 'https://api.musicapi.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'track'; // track, artist, album
  const limit = parseInt(searchParams.get('limit') || '25');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
  }

  try {
    // Build MusicAPI search body
    const body: Record<string, unknown> = {
      type,
      sources: ['deezer'], // Deezer gives us previewUrl
    };

    if (type === 'track') {
      // For tracks, try to parse "artist - title" format
      if (query.includes(' - ')) {
        const [artist, track] = query.split(' - ', 2);
        body.artist = artist.trim();
        body.track = track.trim();
      } else {
        body.track = query;
      }
    } else if (type === 'artist') {
      body.artist = query;
    } else if (type === 'album') {
      body.album = query;
    }

    const res = await fetch(`${API_BASE}/public/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`MusicAPI search error: ${res.status}`, errorText);
      return NextResponse.json({ error: `API error: ${res.status}`, data: [] }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('MusicAPI search failed:', error);
    return NextResponse.json({ error: 'Failed to search', data: [] }, { status: 500 });
  }
}

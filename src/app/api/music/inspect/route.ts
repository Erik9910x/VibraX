import { NextRequest, NextResponse } from 'next/server';

// Inspect a playlist from a music service (Deezer, Spotify, etc)
// Body: { playlistId: string, serviceId: string }
const CLIENT_ID = process.env.MUSICAPI_CLIENT_ID!;
const CLIENT_SECRET = process.env.MUSICAPI_CLIENT_SECRET!;
const BASIC_AUTH = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const API_BASE = 'https://api.musicapi.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playlistId, serviceId } = body;

    if (!playlistId || !serviceId) {
      return NextResponse.json({ error: 'Missing playlistId or serviceId' }, { status: 400 });
    }

    const res = await fetch(`${API_BASE}/public/inspect/playlistItems`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playlistId, serviceId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`MusicAPI inspect error: ${res.status}`, errorText);
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Playlist inspect failed:', error);
    return NextResponse.json({ error: 'Failed to inspect playlist' }, { status: 500 });
  }
}

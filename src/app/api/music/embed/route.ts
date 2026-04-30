import { NextRequest, NextResponse } from 'next/server';

// MusicAPI Embed Player — generates iframe embed for full-length playback
const CLIENT_ID = process.env.MUSICAPI_CLIENT_ID!;
const CLIENT_SECRET = process.env.MUSICAPI_CLIENT_SECRET!;
const BASIC_AUTH = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'Missing track URL' }, { status: 400 });
    }

    const res = await fetch('https://api.musicapi.com/public/embed/url', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Embed error: ${res.status}`, errorText);
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Embed failed:', error);
    return NextResponse.json({ error: 'Failed to get embed' }, { status: 500 });
  }
}

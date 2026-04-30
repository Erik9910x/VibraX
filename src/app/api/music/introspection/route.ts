import { NextResponse } from 'next/server';

// MusicAPI Search Introspection — get supported sources and types
const CLIENT_ID = process.env.MUSICAPI_CLIENT_ID!;
const API_BASE = 'https://api.musicapi.com';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/public/search/introspection`, {
      headers: {
        'Authorization': `Token ${CLIENT_ID}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Introspection failed:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

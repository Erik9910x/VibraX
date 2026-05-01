import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const artist = searchParams.get('artist');

  if (!title || !artist) {
    return NextResponse.json({ error: 'Missing title or artist' }, { status: 400 });
  }

  const endpoints = [
    `https://jio-saavn-api.vercel.app/api/search/songs?query=${encodeURIComponent(title + ' ' + artist)}&limit=1`,
    `https://jio-saavn-api-phi.vercel.app/search?query=${encodeURIComponent(title + ' ' + artist)}&limit=1`,
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(title + ' ' + artist)}&limit=1`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const saavnData = await res.json();
        const results = saavnData.data?.results || saavnData.data || saavnData.results || [];
        if (results && results.length > 0) {
          const song = results[0];
          const dl = song.downloadUrl || song.download_url;
          if (dl && dl.length > 0) {
            // Find highest quality or just the last one
            const audioUrl = dl[dl.length - 1].link || dl[dl.length - 1].url || dl[dl.length - 1];
            return NextResponse.json({ url: audioUrl, source: url });
          }
        }
      }
    } catch (e) {
      console.error(`Upgrade API failed for ${url}:`, e);
    }
  }

  return NextResponse.json({ error: 'No full track found' }, { status: 404 });
}

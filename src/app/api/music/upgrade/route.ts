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

  const fetchEndpoint = async (url: string) => {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const saavnData = await res.json();
    const results = saavnData.data?.results || saavnData.data || saavnData.results || [];
    if (results && results.length > 0) {
      const song = results[0];
      const dl = song.downloadUrl || song.download_url;
      if (dl && dl.length > 0) {
        return { url: dl[dl.length - 1].link || dl[dl.length - 1].url || dl[dl.length - 1], source: url };
      }
    }
    throw new Error('No valid track data');
  };

  try {
    const result = await Promise.any(endpoints.map(fetchEndpoint));
    return NextResponse.json(result);
  } catch (e) {
    console.error(`All endpoints failed for ${title} ${artist}`);
    return NextResponse.json({ error: 'No full track found' }, { status: 404 });
  }
}

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(num >= 10_000 ? 0 : 1) + 'K';
  return num.toString();
}

export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function downloadTrack(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${filename}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download the track. It might be blocked by the source.');
  }
}

// Encode artist name into a URL-safe base64 string that looks like a Spotify ID
export function artistNameToId(name: string): string {
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(name))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return Buffer.from(name, 'utf-8').toString('base64url').replace(/=+$/, '');
}

// Decode artist ID back to name
export function artistIdToName(id: string): string {
  try {
    if (typeof window !== 'undefined') {
      const padded = id.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(atob(padded)));
    }
    return Buffer.from(id, 'base64url').toString('utf-8');
  } catch {
    return decodeURIComponent(id);
  }
}

// Build artist profile URL (clean, no query params)
export function artistUrl(name: string): string {
  return `/app/artist/${artistNameToId(name)}`;
}

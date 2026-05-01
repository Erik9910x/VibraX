'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Repeat1, Shuffle, Heart, Mic2, Download, X,
  RotateCcw, RotateCw, ChevronDown, User, Menu, Music
} from 'lucide-react';
import { usePlayerStore, useFavoritesStore } from '@/lib/store';
import { formatTime, cn } from '@/lib/utils';
import { getLyrics, parseSyncedLyrics, ParsedLyricLine } from '@/lib/lyrics';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingPlayer({ onMenuClick }: { onMenuClick?: () => void }) {
  const {
    currentTrack, isPlaying, volume, isMuted, progress, duration,
    isShuffled, repeatMode,
    togglePlay, next, previous, setVolume, toggleMute,
    setProgress, toggleShuffle, toggleRepeat,
  } = usePlayerStore();

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const progressRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Full-Screen Lyrics State
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<ParsedLyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize and clean up Audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    audioRef.current.setAttribute('playsinline', 'true');
    audioRef.current.setAttribute('webkit-playsinline', 'true');
    audioRef.current.preload = 'auto';
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Track Changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Reset Lyrics state when track changes
    setLyrics([]);
    setPlainLyrics(null);
    setActiveLyricIndex(-1);

    const initializeAudio = async () => {
      let audioUrl = currentTrack.previewUrl;
      
      // Upgrade iTunes preview to full Saavn audio
      if (currentTrack.id.match(/^\d+$/) && currentTrack.previewUrl && currentTrack.previewUrl.includes('apple.com')) {
        const endpoints = [
          `https://jio-saavn-api.vercel.app/api/search/songs?query=${encodeURIComponent(currentTrack.title + ' ' + currentTrack.artist)}&limit=1`,
          `https://jio-saavn-api-phi.vercel.app/search?query=${encodeURIComponent(currentTrack.title + ' ' + currentTrack.artist)}&limit=1`,
          `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(currentTrack.title + ' ' + currentTrack.artist)}&limit=1`
        ];

        for (const url of endpoints) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const saavnData = await res.json();
              const results = saavnData.data?.results || saavnData.data || saavnData.results || [];
              if (results && results.length > 0) {
                const song = results[0];
                const dl = song.downloadUrl || song.download_url;
                if (dl && dl.length > 0) {
                  // Find highest quality or just the last one
                  audioUrl = dl[dl.length - 1].link || dl[dl.length - 1].url || dl[dl.length - 1];
                  console.log(`Upgraded audio via ${url}`);
                  break; 
                }
              }
            }
          } catch (e) {
            console.error(`Failed to upgrade via ${url}`, e);
          }
        }
      }

      if (audioUrl) {
        audio.src = audioUrl;
        audio.load();
        if (usePlayerStore.getState().isPlaying) audio.play().catch(() => {});
      } else {
        audio.src = '';
      }
    };

    initializeAudio();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  // Media Session API — Lock screen controls & background audio support
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album || 'VibraX',
      artwork: [
        { src: currentTrack.imageUrl, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => { togglePlay(); });
    navigator.mediaSession.setActionHandler('pause', () => { togglePlay(); });
    navigator.mediaSession.setActionHandler('previoustrack', () => { previous(); });
    navigator.mediaSession.setActionHandler('nexttrack', () => { next(); });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
        setProgress(details.seekTime);
      }
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [currentTrack, togglePlay, next, previous, setProgress]);

  // Update Page Title when playing
  useEffect(() => {
    if (currentTrack && isPlaying) {
      document.title = `${currentTrack.title} | VibraX`;
    } else if (!currentTrack) {
      document.title = "VibraX";
    }
  }, [currentTrack, isPlaying]);

  // Handle Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && currentTrack?.previewUrl) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.previewUrl]);

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // Audio Events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      if (!isNaN(audio.duration)) setProgress(audio.currentTime);
    };
    const onEnded = () => {
      const state = usePlayerStore.getState();
      if (state.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        setProgress(0);
      } else {
        next();
        // If the track is the same (e.g. single track queue in Repeat All), next() won't trigger the track change effect.
        // We need to manually restart it.
        const newState = usePlayerStore.getState();
        if (newState.currentTrack?.id === state.currentTrack?.id) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
          setProgress(0);
        }
      }
    };
    
    const onLoadedMetadata = () => {
      if (!isNaN(audio.duration)) {
        usePlayerStore.getState().setDuration(audio.duration);
      }
    };
    
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [setProgress, next]);

  // Fallback Progress Simulation for tracks without audio
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isPlaying && currentTrack && !currentTrack.previewUrl) {
      intervalRef.current = setInterval(() => {
        const state = usePlayerStore.getState();
        if (state.progress + 0.25 >= state.duration) state.next();
        else usePlayerStore.setState({ progress: state.progress + 0.25 });
      }, 250);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, currentTrack]);

  // Background Waveform Visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let time = 0;
    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, `rgba(252,213,53,${isPlaying ? 0.15 : 0.02})`);
      grad.addColorStop(1, `rgba(240,185,11,${isPlaying ? 0.1 : 0.01})`);
      ctx.beginPath(); ctx.moveTo(0, h / 2);
      for (let x = 0; x < w; x += 2) {
        const amp = isPlaying ? 0.25 : 0.02;
        const y = h / 2 + Math.sin(x * 0.025 + time) * h * amp + Math.sin(x * 0.012 + time * 0.7) * h * amp * 0.6;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      if (isPlaying) time += 0.04;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Skip +/- 15 seconds
  const skipTime = useCallback((offset: number) => {
    const newTime = Math.max(0, Math.min(progress + offset, duration));
    setProgress(newTime);
    if (audioRef.current && currentTrack?.previewUrl) {
      audioRef.current.currentTime = newTime;
    }
  }, [progress, duration, setProgress, currentTrack?.previewUrl]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'KeyM': e.preventDefault(); toggleMute(); break;
        case 'KeyL': e.preventDefault(); if (currentTrack) setShowLyrics(s => !s); break;
        case 'ArrowRight': e.preventDefault(); skipTime(15); break;
        case 'ArrowLeft': e.preventDefault(); skipTime(-15); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, toggleMute, currentTrack, skipTime]);

  const fetchLyrics = useCallback(async () => {
    if (!currentTrack) return;
    setLyricsLoading(true);
    // Reset state before fetching
    setLyrics([]);
    setPlainLyrics(null);
    setActiveLyricIndex(-1);
    
    const data = await getLyrics(currentTrack.title, currentTrack.artist, currentTrack.album, currentTrack.duration);
    if (data) {
      if (data.syncedLyrics) {
        setLyrics(parseSyncedLyrics(data.syncedLyrics));
      }
      if (data.plainLyrics) {
        setPlainLyrics(data.plainLyrics);
      }
    }
    setLyricsLoading(false);
  }, [currentTrack]);

  // Auto-fetch lyrics in the background immediately when a track changes
  useEffect(() => {
    if (currentTrack) {
      fetchLyrics();
    }
  }, [currentTrack, fetchLyrics]);

  // Handle Lyrics Auto-Scrolling
  useEffect(() => {
    if (!showLyrics || lyrics.length === 0) return;
    
    // Anticipate lyrics by 0.5 second to compensate for audio lag and reading speed
    const idx = lyrics.findLastIndex(l => l.time <= progress + 0.5);
    
    if (idx !== activeLyricIndex && idx >= 0) {
      setActiveLyricIndex(idx);
      
      const container = lyricsContainerRef.current;
      const el = document.getElementById(`lyric-${idx}`);
      if (container && el) {
        // el.offsetTop is relative to the scroll container if it's the offsetParent
        // But scrollIntoView is safer since it calculates all that automatically
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [progress, lyrics, showLyrics, activeLyricIndex]);

  // Click on Lyrics to Seek
  const seekToLyric = (time: number) => {
    setProgress(time);
    if (audioRef.current && currentTrack?.previewUrl) {
      audioRef.current.currentTime = time;
    }
  };

  // Cursor drag handling of the Seekbar
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    seekToLyric(newTime);
  }, [duration, currentTrack?.previewUrl, setProgress]);

  // Download directly via Proxy API to force attachment
  const handleDownload = () => {
    const src = audioRef.current?.src || currentTrack?.previewUrl;
    if (!src || !currentTrack) return;
    const downloadUrl = `/api/download?url=${encodeURIComponent(src)}&filename=${encodeURIComponent(`${currentTrack.artist} - ${currentTrack.title}.mp3`)}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${currentTrack.artist} - ${currentTrack.title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-[var(--player-height)] bg-[#1e2329]/95 backdrop-blur-xl border-t border-[#2b3139] z-50 flex items-center justify-center">
        <p className="text-[#707a8a] text-sm">Select a track to start playing</p>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const liked = isFavorite(currentTrack.id);

  return (
    <>
      <AnimatePresence>
        {/* Full-Screen Spotify-style Lyrics Surface */}
        {showLyrics && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-gradient-to-br from-gray-900 to-black pb-[var(--player-height)] flex flex-col md:flex-row overflow-hidden"
          >
            {/* Background Blur Effect */}
            <div 
              className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none transition-all duration-1000 blur-3xl scale-125 saturate-200"
              style={{ backgroundImage: `url(${currentTrack.imageUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }} 
            />

            {/* Top Close Button */}
            <button 
              onClick={() => setShowLyrics(false)} 
              className="absolute top-6 left-6 z-50 w-10 h-10 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full flex flex-col items-center justify-center text-white/70 hover:text-white transition-all shadow-xl group"
            >
              <ChevronDown className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
            </button>

            {/* Left Column: Album Art */}
            <div className="flex-1 w-full md:w-1/2 flex items-center justify-center p-12 relative z-10 flex-col md:border-r border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentTrack.imageUrl} 
                alt={currentTrack.title}
                className={cn(
                  "w-full max-w-[480px] aspect-square object-cover rounded-2xl shadow-2xl transition-all duration-700",
                  isPlaying ? "scale-100 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" : "scale-95 drop-shadow-md brightness-75"
                )} 
              />
              <div className="mt-8 text-center max-w-[480px]">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-2 line-clamp-1">{currentTrack.title}</h1>
                <p className="text-lg text-white/50">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Right Column: Scrolling Lyrics */}
            <div className="flex-1 w-full md:w-1/2 relative bg-black/20 backdrop-blur-md z-10">
              <div 
                ref={lyricsContainerRef}
                className="absolute inset-0 overflow-y-auto px-8 lg:px-20 py-[40vh] no-scrollbar scroll-smooth"
              >
                {lyricsLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-white/40">
                    <Mic2 className="w-12 h-12 animate-pulse" />
                    <p className="text-lg font-medium tracking-widest animate-pulse">FINDING LYRICS</p>
                  </div>
                ) : lyrics.length > 0 ? (
                  <div className="flex flex-col gap-8">
                    {lyrics.map((line, i) => {
                      const isActive = i === activeLyricIndex;
                      const isPast = i < activeLyricIndex;
                      return (
                        <p 
                          key={i}
                          id={`lyric-${i}`}
                          onClick={() => seekToLyric(line.time)}
                          className={cn(
                            'text-3xl md:text-5xl lg:text-6xl font-black mb-8 md:mb-12 cursor-pointer leading-tight select-none origin-left',
                            'transition-[color,opacity,transform] duration-500 ease-out',
                            isActive ? 'text-white scale-[1.02] opacity-100' 
                            : isPast ? 'text-white/25 scale-100 opacity-60' 
                            : 'text-white/15 scale-100 opacity-40 hover:text-white/40'
                          )}
                        >
                          {line.text}
                        </p>
                      );
                    })}
                  </div>
                ) : plainLyrics ? (
                  <div className="text-xl lg:text-2xl font-medium text-white/60 whitespace-pre-line leading-relaxed text-center">
                    {plainLyrics}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                    <Mic2 className="w-16 h-16 text-white/10 mb-2" />
                    <p className="text-white/30 text-xl font-bold">Lyrics not available yet</p>
                    <p className="text-white/20 text-sm">{currentTrack.title}</p>
                    <button 
                      onClick={fetchLyrics}
                      className="mt-4 px-6 py-2 rounded-full bg-[#fcd535] text-black text-sm font-bold hover:bg-[#f0b90b] transition-colors"
                    >
                      Retry Search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bottom Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[var(--player-height)] bg-[#1e2329]/95 backdrop-blur-xl border-t border-[#2b3139] z-50 overflow-visible">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Global Progress Seeker Bar */}
        <div
          ref={progressRef}
          className="absolute top-0 left-0 right-0 h-1.5 -translate-y-[1px] bg-[#2b3139] cursor-pointer group z-50 hover:h-2 transition-[height]"
          onClick={handleProgressClick}
        >
          {/* Progress Indicator */}
          <div className="h-full bg-gradient-to-r from-[#fcd535] to-[#f0b90b] relative transition-all duration-100 ease-out" style={{ width: `${progressPercent}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ring-2 ring-[#fcd535] bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(252,213,53,0.5)]" />
          </div>
        </div>

        <div className="relative z-10 flex items-center h-full px-4 gap-4">
          
          {/* Left: Track Info */}
          <div className="flex items-center gap-3 w-[25%] min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentTrack.imageUrl}
              onClick={() => setShowLyrics(true)}
              alt={currentTrack.title}
              className={cn('w-12 h-12 rounded-md object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity', isPlaying && 'shadow-lg shadow-blue-500/20')}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate cursor-pointer hover:underline" onClick={() => setShowLyrics(true)}>{currentTrack.title}</p>
              <p className="text-xs text-white/50 truncate cursor-pointer hover:underline">{currentTrack.artist}</p>
            </div>
            <button onClick={() => toggleFavorite(currentTrack.id)} className="flex-shrink-0 p-2 ml-1 hidden lg:block">
              <Heart className={cn('w-4 h-4 transition-colors', liked ? 'text-[#fcd535] fill-[#fcd535]' : 'text-[#707a8a] hover:text-white')} />
            </button>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex-[2] flex flex-col items-center justify-center gap-1.5 w-[50%]">
            <div className="flex items-center gap-4 lg:gap-6">
              <button onClick={toggleShuffle} className={cn('w-6 h-6 flex items-center justify-center hidden sm:flex', isShuffled ? 'text-[#fcd535]' : 'text-white/40 hover:text-white/80')}>
                <Shuffle className="w-[18px] h-[18px]" />
              </button>
              
              <button onClick={() => skipTime(-15)} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white transition-colors" title="Skip Backward 15s">
                <RotateCcw className="w-[18px] h-[18px]" />
              </button>

              <button onClick={previous} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button onClick={togglePlay} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-1" />}
              </button>

              <button onClick={next} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button onClick={() => skipTime(15)} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white transition-colors" title="Skip Forward 15s">
                <RotateCw className="w-[18px] h-[18px]" />
              </button>

              <button onClick={toggleRepeat} className={cn('w-6 h-6 flex items-center justify-center hidden sm:flex', repeatMode !== 'off' ? 'text-[#fcd535]' : 'text-white/40 hover:text-white/80')}>
                {repeatMode === 'one' ? <Repeat1 className="w-[18px] h-[18px]" /> : <Repeat className="w-[18px] h-[18px]" />}
              </button>
            </div>
            
            {/* Timers */}
            <div className="flex items-center gap-2 text-[11px] text-white/30 font-medium tracking-wide">
              <span>{formatTime(progress)}</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Extras */}
          <div className="flex items-center justify-end gap-3 w-[25%]">
            
            {/* Lyrics Toggle */}
            <button
              onClick={() => setShowLyrics(s => !s)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                showLyrics ? 'text-[#181a20] bg-[#fcd535] ring-1 ring-[#fcd535]/30' : 'text-white/40 hover:text-white/80'
              )}
              title="Lyrics View (L)"
            >
              <Mic2 className="w-[18px] h-[18px] stroke-2" />
            </button>

            {/* Download Option */}
            <button
              onClick={handleDownload}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
              title="Download Full Track"
            >
              <Download className="w-[18px] h-[18px]" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group hidden md:flex">
              <button onClick={toggleMute} className="text-white/40 hover:text-white/80 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range" min="0" max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 lg:w-24 h-1.5 rounded-full appearance-none bg-white/10 accent-white outline-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #ffffff ${isMuted ? 0 : volume}%, rgba(255,255,255,0.1) ${isMuted ? 0 : volume}%)` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

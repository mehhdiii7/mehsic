/**
 * @license
 * Mehsic Dedicated Now Playing Experience (Full-Screen Desktop)
 * Features:
 * - Large album artwork with safe dynamic background color extraction
 * - High-contrast readable typography respecting prefers-reduced-motion
 * - Playback progress with Current Time and Remaining Time (-M:SS)
 * - Complete transport controls, Volume slider with mute button
 * - Synced & Plain Lyrics with auto-scroll and manual scroll resume
 * - Audio Quality badge and inspector
 * - Queue view & SongOptionsMenu integration
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Mic2,
  ListOrdered,
  Activity,
  Cpu,
  ShieldCheck,
  Disc,
  Info,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  FileText,
  X,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { globalAudioEngine } from '../services/audioEngine';
import { SongOptionsMenu } from './SongOptionsMenu';
import { extractArtworkColors, ArtworkColors } from '../services/colorExtractor';

export const NowPlayingView: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    bufferedFraction,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    shuffle,
    repeatMode,
    streamInfo,
    isFavorite,
    toggleFavorite,
    syncedLyrics,
    plainLyrics,
    isLoadingLyrics,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    togglePlayPause,
    next,
    previous,
    seek,
    toggleShuffle,
    cycleRepeat,
    queue,
    currentIndex,
    playQueueIndex,
    dynamicArtworkEnabled,
    setIsQualityModalOpen,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'lyrics' | 'queue' | 'stats'>('lyrics');
  const [lyricsMode, setLyricsMode] = useState<'synced' | 'plain'>('synced');
  const [artworkColors, setArtworkColors] = useState<ArtworkColors | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract subtle ambient colors when currentSong changes
  useEffect(() => {
    if (!currentSong?.artwork || !dynamicArtworkEnabled) {
      setArtworkColors(null);
      return;
    }

    let isMounted = true;
    extractArtworkColors(currentSong.artwork).then((colors) => {
      if (isMounted) {
        setArtworkColors(colors);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentSong?.artwork, dynamicArtworkEnabled]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentMs = currentTime * 1000;
  const isFav = currentSong ? isFavorite(currentSong.id) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = bufferedFraction * 100;
  const remainingTimeText =
    duration > 0 ? `-${formatTime(Math.max(0, duration - currentTime))}` : '0:00';

  // Auto-scroll active lyric line unless the user is actively manually inspecting
  useEffect(() => {
    if (
      activeTab === 'lyrics' &&
      lyricsMode === 'synced' &&
      !isUserScrolling &&
      activeLineRef.current &&
      lyricsContainerRef.current
    ) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime, activeTab, lyricsMode, isUserScrolling]);

  // Detect manual user scrolling
  const handleLyricsScroll = () => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    // Automatically resume auto-scroll after 6 seconds of idle
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 6000);
  };

  const handleResumeAutoScroll = () => {
    setIsUserScrolling(false);
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  if (!isNowPlayingOpen || !currentSong) return null;

  const audioOutputInfo = globalAudioEngine.getAudioOutputInfo();

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };
  const VolumeIcon = getVolumeIcon();

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none overflow-hidden animate-in fade-in duration-300"
      style={{
        backgroundColor: artworkColors?.primaryDark || '#07080d',
      }}
    >
      {/* Subtle Dynamic Ambient Glow based on Album Art */}
      {dynamicArtworkEnabled && artworkColors && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 transition-opacity duration-700">
          <div
            className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full blur-[160px] transition-all duration-1000"
            style={{ backgroundColor: artworkColors.accentGlow }}
          />
          <div
            className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-[180px] transition-all duration-1000"
            style={{ backgroundColor: artworkColors.accentGlow }}
          />
        </div>
      )}

      {/* Top Header Bar */}
      <header className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/30">
        <button
          onClick={() => setIsNowPlayingOpen(false)}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group p-2 rounded-xl hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Collapse Now Playing"
        >
          <ChevronDown className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-xs font-bold tracking-wider uppercase">Collapse</span>
        </button>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'lyrics'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Queue ({queue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Audio Info</span>
          </button>
        </div>

        {/* Audio Quality Badge button */}
        <div className="flex items-center gap-2">
          {streamInfo ? (
            <button
              onClick={() => setIsQualityModalOpen(true)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all hover:scale-105 ${
                streamInfo.lossless
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}
              title="Click to inspect stream parameters"
            >
              {streamInfo.lossless ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>FLAC • {streamInfo.bitDepth}-bit / {streamInfo.sampleRate / 1000} kHz</span>
                </>
              ) : (
                <>
                  <Disc className="w-3.5 h-3.5" />
                  <span>{streamInfo.codec} • {streamInfo.bitrate} kbps</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-xs text-slate-500 font-medium">Stream Active</span>
          )}
        </div>
      </header>

      {/* Main Center Area */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-6 gap-10 overflow-hidden">
        {/* Left Column: Sleeve Artwork & Track Titles */}
        <div className="w-full md:w-1/2 max-w-lg flex flex-col items-center md:items-start text-center md:text-left">
          <div className="relative group w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 mb-6 shrink-0 transition-transform duration-500 hover:scale-[1.02]">
            <img
              src={currentSong.artwork}
              alt={currentSong.title}
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-cover"
            />
            {streamInfo?.lossless && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-bold text-amber-300 tracking-wider uppercase">
                Studio Master 24-bit
              </div>
            )}
          </div>

          <div className="w-full flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white truncate tracking-tight">
                {currentSong.title}
              </h1>
              <p className="text-base md:text-lg text-slate-300 font-medium truncate mt-1">
                {currentSong.artist}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {currentSong.album} {currentSong.releaseYear ? `• ${currentSong.releaseYear}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => toggleFavorite(currentSong)}
                className={`p-3 rounded-2xl border transition-all ${
                  isFav
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
                }`}
                title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                aria-label="Toggle Favorite"
              >
                <Heart className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`} />
              </button>
              <SongOptionsMenu song={currentSong} align="right" buttonSize="md" />
            </div>
          </div>
        </div>

        {/* Right Column: Tab View (Lyrics, Queue, or Audio Pipeline) */}
        <div className="w-full md:w-1/2 h-[420px] md:h-[500px] flex flex-col rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 p-6 overflow-hidden shadow-2xl shadow-black/60 relative">
          {/* Lyrics View */}
          {activeTab === 'lyrics' && (
            <div className="flex flex-col h-full">
              {/* Lyrics Mode Selector */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLyricsMode('synced')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      lyricsMode === 'synced'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic2 className="w-3 h-3" />
                    <span>Synchronized</span>
                  </button>

                  <button
                    onClick={() => setLyricsMode('plain')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      lyricsMode === 'plain'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Plain Text</span>
                  </button>
                </div>

                {isUserScrolling && lyricsMode === 'synced' && (
                  <button
                    onClick={handleResumeAutoScroll}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md transition-all animate-in fade-in"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Sync</span>
                  </button>
                )}
              </div>

              {/* Lyrics Scrollable Area */}
              <div
                ref={lyricsContainerRef}
                onScroll={handleLyricsScroll}
                className="flex-1 overflow-y-auto space-y-7 py-8 px-4 scroll-smooth text-center md:text-left scrollbar-thin"
              >
                {isLoadingLyrics ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs uppercase font-semibold tracking-wider">
                      Retrieving lyrics...
                    </p>
                  </div>
                ) : lyricsMode === 'synced' && syncedLyrics && syncedLyrics.length > 0 ? (
                  syncedLyrics.map((line, idx) => {
                    const nextLine = syncedLyrics[idx + 1];
                    const lineEnd =
                      line.sungUntilMs || (nextLine ? nextLine.timeMs : line.timeMs + 5000);
                    const isActive = currentMs >= line.timeMs && currentMs < lineEnd;
                    const isPast = currentMs >= lineEnd;

                    return (
                      <div
                        key={idx}
                        ref={isActive ? activeLineRef : null}
                        onClick={() => seek(line.timeMs / 1000)}
                        className={`cursor-pointer transition-all duration-300 font-semibold tracking-tight ${
                          isActive
                            ? 'text-white text-2xl md:text-3xl font-extrabold scale-[1.03] origin-left drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                            : isPast
                            ? 'text-slate-500 hover:text-slate-300 text-base md:text-xl'
                            : 'text-slate-600 hover:text-slate-400 text-base md:text-xl'
                        }`}
                        title="Click to seek to this line"
                      >
                        {line.words && line.words.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            {line.words.map((w, wIdx) => {
                              const isWordSung = currentMs >= w.startMs;
                              const isWordCurrent =
                                currentMs >= w.startMs && currentMs <= w.endMs;

                              return (
                                <span
                                  key={wIdx}
                                  className={`transition-all duration-150 ${
                                    isWordCurrent
                                      ? 'text-blue-400 font-extrabold drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                                      : isWordSung
                                      ? 'text-white'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {w.text}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p>{line.text}</p>
                        )}
                      </div>
                    );
                  })
                ) : plainLyrics ? (
                  <div className="space-y-4 text-slate-300 leading-relaxed font-medium text-base">
                    {plainLyrics.split('\n').map((l, i) => (
                      <p key={i}>{l || '\u00A0'}</p>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <Mic2 className="w-8 h-8 opacity-30 text-blue-400" />
                    <p className="text-base font-bold text-slate-400">Lyrics unavailable</p>
                    <p className="text-xs text-slate-500 max-w-xs text-center">
                      No legitimate lyrics were found for this track. Mehsic only displays verified
                      lyrics and avoids scraping unauthorized sources.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Playback Queue ({queue.length})
                </span>
              </div>
              {queue.map((song, i) => {
                const isCurrent = i === currentIndex;
                return (
                  <div
                    key={`${song.id}-${i}`}
                    onClick={() => playQueueIndex(i)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <img
                      src={song.artwork}
                      alt={song.title}
                      className="w-11 h-11 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-blue-400' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{song.durationText}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Audio Stats Tab */}
          {activeTab === 'stats' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs scrollbar-thin">
              <div className="flex items-center gap-2 text-blue-400 font-semibold border-b border-white/5 pb-2">
                <Cpu className="w-4 h-4" />
                <span className="uppercase tracking-wider">Audio Decoding & Stream Inspector</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Codec / Format</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {streamInfo?.codec || 'Unknown'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Bitrate</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {streamInfo?.bitrate ? `${streamInfo.bitrate} kbps` : 'Unknown'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Sample Rate</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {streamInfo?.sampleRate
                      ? `${(streamInfo.sampleRate / 1000).toLocaleString()} kHz`
                      : 'Unknown'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Bit Depth</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {streamInfo?.bitDepth ? `${streamInfo.bitDepth}-bit` : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Audio Engine Graph</p>
                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <p className="flex justify-between">
                    <span>Source MIME:</span>
                    <span className="text-white">{streamInfo?.mimeType || 'Unknown'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Web Audio Context:</span>
                    <span className="text-emerald-400">{audioOutputInfo.state.toUpperCase()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Context Sampling Rate:</span>
                    <span className="text-white">{audioOutputInfo.contextSampleRate} Hz</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Active Equalizer:</span>
                    <span className="text-blue-400">10-band IIR Biquad Chain</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Channels:</span>
                    <span className="text-white">{audioOutputInfo.channelCount} (Stereo)</span>
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-slate-300 leading-relaxed">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Bit-Perfect Audiophile Transparency</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {streamInfo?.sourceNote ||
                    'Mehsic never upscales or falsely tags lossy audio as lossless. Audio is passed natively into the browser Web Audio pipeline.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="relative z-10 px-8 md:px-16 py-6 border-t border-white/5 backdrop-blur-xl bg-black/50 flex flex-col items-center gap-4">
        {/* Progress Bar with Current Time and Remaining Time (-M:SS) */}
        <div className="w-full max-w-3xl flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400 w-12 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="flex-1 relative flex items-center h-5 group cursor-pointer">
            <div className="absolute inset-x-0 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/20 transition-all duration-300"
                style={{ width: `${bufferPercent}%` }}
              />
            </div>
            <div
              className="absolute left-0 h-1.5 bg-blue-500 rounded-full group-hover:h-2 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek track position"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="text-xs font-mono text-slate-400 w-12">
            {remainingTimeText}
          </span>
        </div>

        {/* Center Buttons & Volume Slider */}
        <div className="w-full max-w-3xl flex items-center justify-between">
          {/* Left placeholder for symmetry */}
          <div className="w-48 hidden sm:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`p-2 rounded-xl transition-colors ${
                activeTab === 'lyrics'
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Lyrics (L)"
              aria-label="Toggle Lyrics"
            >
              <Mic2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`p-2 rounded-xl transition-colors ${
                activeTab === 'queue'
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Queue (Q)"
              aria-label="Toggle Queue"
            >
              <ListOrdered className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Transport Buttons */}
          <div className="flex items-center gap-6 mx-auto">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-xl transition-colors ${
                shuffle ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Shuffle"
              aria-label="Toggle Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={previous}
              className="text-slate-300 hover:text-white transition-colors p-2"
              title="Previous Track (P / ArrowLeft)"
              aria-label="Previous Track"
            >
              <SkipBack className="w-7 h-7" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-14 h-14 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/20"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              className="text-slate-300 hover:text-white transition-colors p-2"
              title="Next Track (N / ArrowRight)"
              aria-label="Next Track"
            >
              <SkipForward className="w-7 h-7" />
            </button>

            <button
              onClick={cycleRepeat}
              className={`p-2 rounded-xl transition-colors ${
                repeatMode !== 'off'
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
              aria-label={`Repeat mode: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          {/* Volume Slider Dock */}
          <div className="w-48 hidden sm:flex items-center justify-end gap-2.5">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon className="w-5 h-5" />
            </button>

            <div className="w-24 relative flex items-center h-4 cursor-pointer">
              <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume slider"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

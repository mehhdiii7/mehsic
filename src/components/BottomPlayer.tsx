/**
 * @license
 * Mehsic Persistent Bottom Player
 * Displays authentic StreamInfo metrics and provides seamless media controls.
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Mic2,
  ListOrdered,
  Heart,
  Sliders,
  AlertCircle,
  X,
} from 'lucide-react';
import { SongOptionsMenu } from './SongOptionsMenu';
import { usePlayer } from '../context/PlayerContext';

export const BottomPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    bufferedFraction,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    streamInfo,
    favorites,
    isFavorite,
    isLyricsOpen,
    isQueueOpen,
    error,
    clearError,
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    setIsNowPlayingOpen,
    setIsLyricsOpen,
    setIsQueueOpen,
    setIsEqualizerOpen,
    setIsQualityModalOpen,
  } = usePlayer();

  const [showRemainingTime, setShowRemainingTime] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = bufferedFraction * 100;
  const isFav = currentSong ? isFavorite(currentSong.id) : false;

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };
  const VolumeIcon = getVolumeIcon();

  // Format real audio quality text from streamInfo
  const getQualityLabel = () => {
    if (!streamInfo) return null;
    if (streamInfo.lossless) {
      return `${streamInfo.codec} • ${streamInfo.bitDepth}-bit • ${streamInfo.sampleRate / 1000} kHz`;
    }
    return `${streamInfo.bitrate} kbps • ${streamInfo.codec}`;
  };

  return (
    <>
      {/* Playback Error Toast Bar */}
      {error && (
        <div className="bg-rose-950/90 border-t border-rose-500/40 text-rose-200 px-6 py-2 text-xs flex items-center justify-between z-40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
            title="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <footer className="h-24 bg-[#0a0c13]/95 backdrop-blur-xl border-t border-white/8 px-6 flex items-center justify-between select-none relative z-30">
        {/* Track Info (Left) */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[200px] max-w-[320px]">
          {currentSong ? (
            <>
              <div
                onClick={() => setIsNowPlayingOpen(true)}
                className="relative group cursor-pointer w-14 h-14 rounded-xl overflow-hidden shadow-md shadow-black/40 shrink-0 border border-white/10"
              >
                <img
                  src={currentSong.artwork}
                  alt={currentSong.title}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => setIsNowPlayingOpen(true)}
                    className="text-sm font-semibold text-white hover:underline cursor-pointer truncate"
                  >
                    {currentSong.title}
                  </span>
                  <button
                    onClick={() => toggleFavorite(currentSong)}
                    className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                      }`}
                    />
                  </button>
                  <SongOptionsMenu song={currentSong} align="left" buttonSize="sm" />
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-400 truncate hover:text-slate-200 cursor-pointer">
                    {currentSong.artist}
                  </p>
                  {streamInfo && (
                    <button
                      onClick={() => setIsQualityModalOpen(true)}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase border transition-all truncate ${
                        streamInfo.lossless
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25'
                      }`}
                      title={streamInfo.sourceNote || 'Authentic Audio Stream Quality'}
                    >
                      {getQualityLabel()}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-800/60 border border-white/5 flex items-center justify-center text-slate-600">
                <Play className="w-5 h-5 ml-0.5 opacity-40" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Ready to listen</p>
                <p className="text-xs text-slate-600">Search any artist or song</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Controls & Scrubber (Center) */}
        <div className="flex flex-col items-center gap-2 max-w-2xl w-2/4">
          {/* Buttons */}
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              title={shuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
              className={`p-1.5 rounded-lg transition-colors ${
                shuffle ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={previous}
              title="Previous (Shift+P / ArrowLeft)"
              className="text-slate-300 hover:text-white transition-colors p-1"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              disabled={!currentSong}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-lg ${
                isPlaying
                  ? 'bg-white text-slate-950 shadow-white/20 hover:scale-105'
                  : 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-500 hover:scale-105'
              } ${!currentSong ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              title="Next (Shift+N / ArrowRight)"
              className="text-slate-300 hover:text-white transition-colors p-1"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={cycleRepeat}
              title={`Repeat: ${repeatMode}`}
              className={`p-1.5 rounded-lg transition-colors ${
                repeatMode !== 'off' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Timeline Slider with Buffer indication */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="flex-1 relative flex items-center h-4 group cursor-pointer">
              {/* Background track */}
              <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full overflow-hidden">
                {/* Buffer track */}
                <div
                  className="h-full bg-white/20 transition-all duration-300"
                  style={{ width: `${bufferPercent}%` }}
                />
              </div>

              {/* Elapsed track */}
              <div
                className="absolute left-0 h-1 bg-blue-500 rounded-full group-hover:h-1.5 transition-all"
                style={{ width: `${progressPercent}%` }}
              />

              {/* HTML Range Input Overlay for precision seeking */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {/* Handle Thumb */}
              <div
                className="absolute w-3 h-3 bg-white rounded-full shadow-md shadow-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -translate-x-1/2"
                style={{ left: `${progressPercent}%` }}
              />
            </div>

            <span
              onClick={() => setShowRemainingTime(!showRemainingTime)}
              className="text-[11px] font-mono text-slate-400 w-11 cursor-pointer hover:text-white transition-colors"
              title="Click to toggle remaining time"
            >
              {showRemainingTime
                ? `-${formatTime(Math.max(0, duration - currentTime))}`
                : formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Auxiliary Controls & Volume (Right) */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
          <button
            onClick={() => setIsLyricsOpen(!isLyricsOpen)}
            title="Synced Lyrics (L)"
            className={`p-2 rounded-xl transition-all ${
              isLyricsOpen
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Mic2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            title="Queue (Q)"
            className={`p-2 rounded-xl transition-all ${
              isQueueOpen
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsEqualizerOpen(true)}
            title="Graphic Equalizer"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 group ml-1">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              <VolumeIcon className="w-4 h-4" />
            </button>

            <div className="w-20 relative flex items-center h-4 cursor-pointer">
              <div className="absolute inset-x-0 h-1 bg-white/15 rounded-full overflow-hidden">
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
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={() => setIsNowPlayingOpen(true)}
            title="Full Now Playing (F)"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all ml-1"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </>
  );
};

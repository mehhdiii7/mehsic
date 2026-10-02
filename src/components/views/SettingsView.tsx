/**
 * @license
 * Mehsic Settings View & System Preferences
 * Expanded settings covering:
 * - Playback: Default volume, Crossfade, Gapless playback, Audio quality tier
 * - Interface: Theme, Compact mode, Animations, Dynamic artwork background
 * - Keyboard: Complete laptop-friendly shortcut reference table
 * - Audio: Live stream inspection (codec, bitrate, sample rate, bit depth, Web Audio graph)
 * - Licensing & BitChord (GPLv3) attribution
 */

import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  Zap,
  Volume2,
  Info,
  ExternalLink,
  Code,
  Sparkles,
  CheckCircle2,
  Lock,
  Keyboard,
  Palette,
  Activity,
  Cpu,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { PlaybackQuality } from '../../types/music';
import { globalAudioEngine } from '../../services/audioEngine';

export const SettingsView: React.FC = () => {
  const {
    playbackQuality,
    setPlaybackQuality,
    volume,
    setVolume,
    streamInfo,
    dynamicArtworkEnabled,
    setDynamicArtworkEnabled,
    compactMode,
    setCompactMode,
    animationsEnabled,
    setAnimationsEnabled,
    crossfade,
    setCrossfade,
    gapless,
    setGapless,
    setIsEqualizerOpen,
    setIsQualityModalOpen,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'playback' | 'interface' | 'keyboard' | 'audio'>('playback');

  const audioOutputInfo = globalAudioEngine.getAudioOutputInfo();

  const shortcutList = [
    { key: 'Space', action: 'Play / Pause audio playback' },
    { key: 'Arrow Left', action: 'Seek backward 5 seconds' },
    { key: 'Arrow Right', action: 'Seek forward 5 seconds' },
    { key: 'Arrow Up', action: 'Increase volume (+5%)' },
    { key: 'Arrow Down', action: 'Decrease volume (-5%)' },
    { key: 'N', action: 'Skip to next track in queue' },
    { key: 'P', action: 'Jump to previous track or track start' },
    { key: 'M', action: 'Toggle mute / unmute' },
    { key: 'Q', action: 'Toggle playback queue panel' },
    { key: 'L', action: 'Toggle synchronized lyrics view' },
    { key: 'F', action: 'Favorite / Unfavorite current track' },
    { key: 'Escape', action: 'Close full-screen Now Playing or open modal' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto pb-24 select-none">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure playback fidelity, interface customization, laptop shortcuts, and audio pipeline
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('playback')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'playback'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Playback</span>
        </button>

        <button
          onClick={() => setActiveTab('interface')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'interface'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Interface</span>
        </button>

        <button
          onClick={() => setActiveTab('keyboard')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'keyboard'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Keyboard Shortcuts</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'audio'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audio Pipeline</span>
        </button>
      </div>

      {/* 1. Playback Tab */}
      {activeTab === 'playback' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Default Audio Quality Tier */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Default Audio Quality</p>
                <p className="text-xs text-slate-400">
                  Current Tier: <span className="text-blue-400 capitalize font-medium">{playbackQuality}</span>
                </p>
              </div>
              <button
                onClick={() => setIsQualityModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
              >
                Inspect Stream Tiers
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {(['auto', 'high', 'very_high', 'lossless'] as PlaybackQuality[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setPlaybackQuality(tier)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                    playbackQuality === tier
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tier.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Preference */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Default Playback Volume</p>
                <p className="text-xs text-slate-400">
                  Persistently remembered across browser sessions
                </p>
              </div>
              <span className="text-sm font-mono text-blue-400 font-bold">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Crossfade Duration */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Crossfade Duration</p>
                <p className="text-xs text-slate-400">Smooth gain transition between sequential tracks</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={1}
                  value={crossfade}
                  onChange={(e) => setCrossfade(Number(e.target.value))}
                  className="w-32 cursor-pointer accent-blue-500"
                />
                <span className="text-xs font-mono text-blue-400 font-bold w-8 text-right">
                  {crossfade}s
                </span>
              </div>
            </div>
          </div>

          {/* Gapless Playback */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Gapless Playback</p>
              <p className="text-xs text-slate-400">
                Maintains audio pipeline to remove silence between live album cuts
              </p>
            </div>
            <button
              onClick={() => setGapless(!gapless)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                gapless ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  gapless ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Equalizer Shortcut */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Hardware Equalizer</p>
              <p className="text-xs text-slate-400">10-band studio frequency response equalizer</p>
            </div>
            <button
              onClick={() => setIsEqualizerOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all"
            >
              Configure EQ
            </button>
          </div>
        </div>
      )}

      {/* 2. Interface Tab */}
      {activeTab === 'interface' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Theme Option */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3">
            <p className="text-sm font-semibold text-white">Theme</p>
            <p className="text-xs text-slate-400">
              Desktop-optimized dark aesthetic inspired by modern music workstation interfaces
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-blue-500/40 bg-blue-600/10 text-white text-xs font-bold flex items-center justify-between">
                <span>Midnight Audiophile (Active)</span>
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="p-3.5 rounded-xl border border-white/5 bg-white/3 text-slate-400 text-xs font-medium flex items-center justify-between">
                <span>OLED Pure Black (High Contrast)</span>
                <span className="text-[10px] text-slate-500 uppercase">Built-in</span>
              </div>
            </div>
          </div>

          {/* Dynamic Artwork Background Toggle */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Dynamic Artwork Background</p>
              <p className="text-xs text-slate-400">
                Safely adapts ambient Now Playing backlight based on album artwork
              </p>
            </div>
            <button
              onClick={() => setDynamicArtworkEnabled(!dynamicArtworkEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                dynamicArtworkEnabled ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  dynamicArtworkEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Compact Mode Toggle */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Compact Mode</p>
              <p className="text-xs text-slate-400">Tighter row padding for smaller laptop screens</p>
            </div>
            <button
              onClick={() => setCompactMode(!compactMode)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                compactMode ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  compactMode ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Motion & Animations Toggle */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Smooth Transitions & Animations</p>
              <p className="text-xs text-slate-400">
                Hardware-accelerated interface motion (respects system prefers-reduced-motion)
              </p>
            </div>
            <button
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                animationsEnabled ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  animationsEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* 3. Keyboard Shortcuts Tab */}
      {activeTab === 'keyboard' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Action
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Laptop Shortcut
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {shortcutList.map((item) => (
                <div key={item.key} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.action}</span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/15 font-mono text-[11px] text-blue-300 shadow-sm">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 italic pt-2">
              Note: Shortcuts are intelligently suppressed when typing in input fields, textareas, or search boxes.
            </p>
          </div>
        </div>
      )}

      {/* 4. Audio Pipeline Tab */}
      {activeTab === 'audio' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-blue-400 font-semibold border-b border-white/5 pb-3">
              <Cpu className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Active Audio Stream Inspection</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Codec</p>
                <p className="text-sm font-bold text-white mt-1">
                  {streamInfo?.codec || 'Unknown'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Bitrate</p>
                <p className="text-sm font-bold text-white mt-1">
                  {streamInfo?.bitrate ? `${streamInfo.bitrate} kbps` : 'Unknown'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Sample Rate</p>
                <p className="text-sm font-bold text-white mt-1">
                  {streamInfo?.sampleRate
                    ? `${(streamInfo.sampleRate / 1000).toLocaleString()} kHz`
                    : 'Unknown'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Bit Depth</p>
                <p className="text-sm font-bold text-white mt-1">
                  {streamInfo?.bitDepth ? `${streamInfo.bitDepth}-bit` : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-2 text-xs">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                Web Audio Engine Pipeline
              </p>
              <div className="font-mono text-[11px] text-slate-400 space-y-1">
                <p className="flex justify-between">
                  <span>Context Graph State:</span>
                  <span className="text-emerald-400 font-bold">{audioOutputInfo.state.toUpperCase()}</span>
                </p>
                <p className="flex justify-between">
                  <span>Context Sampling Rate:</span>
                  <span className="text-white">{audioOutputInfo.contextSampleRate} Hz</span>
                </p>
                <p className="flex justify-between">
                  <span>Audio Channels:</span>
                  <span className="text-white">{audioOutputInfo.channelCount} (Stereo Channel Pair)</span>
                </p>
                <p className="flex justify-between">
                  <span>Lossless PCM Passthrough:</span>
                  <span className={streamInfo?.lossless ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                    {streamInfo?.lossless ? 'Active (Bit-Exact PCM)' : 'Standard Stream'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-500/20 text-xs text-slate-300 space-y-2 leading-relaxed">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Authentic Quality Guarantee</span>
            </div>
            <p className="text-slate-400">
              Mehsic strictly presents genuine stream technical parameters. We never artificially upscale lossy MP3/AAC streams to pretend they are FLAC or Hi-Res. When lossless stream data is unavailable, fields display "Unknown" rather than fabricated measurements.
            </p>
          </div>
        </div>
      )}

      {/* Licensing & BitChord Open Source Attribution */}
      <section className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3 text-xs text-slate-400 leading-relaxed">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white">Mehsic Web Player</h3>
            <p className="text-[11px] text-slate-500">Version 1.0.0 (Desktop Edition)</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-semibold text-[10px] uppercase border border-blue-500/30">
            GPLv3 Open Source
          </span>
        </div>

        <p>
          Mehsic is inspired by the open-source <strong className="text-slate-200">BitChord</strong> Android music player by Kushagra Singh (<a href="https://github.com/kushagrasinghx/BitChord" target="_blank" rel="noreferrer" className="text-blue-400 underline">github.com/kushagrasinghx/BitChord</a>), licensed under <strong className="text-slate-200">GNU General Public License v3.0 (GPLv3)</strong>.
        </p>
      </section>
    </div>
  );
};

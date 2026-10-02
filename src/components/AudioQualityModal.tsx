/**
 * @license
 * Mehsic Audio Quality & Stream Inspector Modal
 * Displays actual verified stream metrics (codec, bitrate, sample rate, bit depth, lossless status, provider)
 * with "Unknown" fallbacks and quality tier selection.
 */

import React from 'react';
import { X, ShieldCheck, CheckCircle2, Info, Disc, Cpu } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { PlaybackQuality } from '../types/music';

export const AudioQualityModal: React.FC = () => {
  const {
    isQualityModalOpen,
    setIsQualityModalOpen,
    playbackQuality,
    setPlaybackQuality,
    streamInfo,
    currentSong,
    provider,
  } = usePlayer();

  if (!isQualityModalOpen) return null;

  const tiers: Array<{
    id: PlaybackQuality;
    label: string;
    description: string;
    details: string;
    isLossless?: boolean;
  }> = [
    {
      id: 'auto',
      label: 'Auto (Recommended)',
      description: 'Dynamically streams the highest legitimate tier available from the provider.',
      details: 'Plays 256 kbps AAC / 320 kbps MP3 or studio lossless when legitimately provided.',
    },
    {
      id: 'high',
      label: 'High (160–256 kbps)',
      description: 'Transparent high-definition encoding using AAC LC or Opus.',
      details: 'Instant buffering and minimal latency on standard laptop connections.',
    },
    {
      id: 'very_high',
      label: 'Very High (320 kbps)',
      description: 'Maximum lossy bitrate with full 44.1 kHz / 48 kHz frequency bandwidth.',
      details: 'Highest bitrate lossy audio streams.',
    },
    {
      id: 'lossless',
      label: 'Lossless & Studio Master (FLAC)',
      description: 'Direct bit-exact PCM stream with zero lossy compression.',
      details: 'Active only when the selected provider legitimately provides uncompressed audio.',
      isLossless: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0e111a] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/80 flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Audio Quality & Pipeline</h2>
              <p className="text-xs text-slate-400">Authentic stream inspection & bitrate controls</p>
            </div>
          </div>

          <button
            onClick={() => setIsQualityModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Stream Inspector */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {currentSong ? `Current Track: ${currentSong.title}` : 'Stream Inspector'}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase border ${
                streamInfo?.lossless
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}
            >
              {streamInfo?.lossless ? 'Lossless FLAC' : 'Standard Stream'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Codec</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {streamInfo?.codec || 'Unknown'}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Bitrate</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {streamInfo?.bitrate ? `${streamInfo.bitrate} kbps` : 'Unknown'}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Sample Rate</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {streamInfo?.sampleRate
                  ? `${(streamInfo.sampleRate / 1000).toLocaleString()} kHz`
                  : 'Unknown'}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Bit Depth</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {streamInfo?.bitDepth ? `${streamInfo.bitDepth}-bit` : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-1 space-y-1">
            <p className="flex justify-between">
              <span>Source Provider:</span>
              <span className="text-slate-200 font-medium">{provider.name}</span>
            </p>
            {streamInfo?.sourceNote && (
              <p className="italic text-slate-400">{streamInfo.sourceNote}</p>
            )}
          </div>
        </div>

        {/* Quality Preference Tiers */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Streaming Quality Preference
          </p>

          <div className="space-y-2">
            {tiers.map((t) => {
              const isSelected = playbackQuality === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setPlaybackQuality(t.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-500/10'
                      : 'bg-white/3 border-white/5 hover:bg-white/7'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{t.label}</span>
                      {t.isLossless && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                          FLAC
                        </span>
                      )}
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{t.description}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.details}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bit-Perfect Transparency Notice */}
        <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Mehsic strictly reports genuine stream technical parameters. We never artificially upscale lossy MP3/AAC streams to pretend they are FLAC or Hi-Res. When lossless stream data is unavailable, fields display "Unknown" rather than fabricated measurements.
          </p>
        </div>
      </div>
    </div>
  );
};

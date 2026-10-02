/**
 * @license
 * Mehsic 10-Band Graphic Equalizer Modal
 */

import React from 'react';
import { X, Sliders, RotateCcw } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { EQUALIZER_FREQUENCIES, EQUALIZER_PRESETS } from '../services/audioEngine';

export const EqualizerModal: React.FC = () => {
  const {
    isEqualizerOpen,
    setIsEqualizerOpen,
    eqGains,
    eqPreset,
    setEqBandGain,
    setEqPreset,
  } = usePlayer();

  if (!isEqualizerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0e111a] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/80 flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">10-Band Graphic Equalizer</h2>
              <p className="text-xs text-slate-400">Hardware-accelerated IIR filtering via Web Audio</p>
            </div>
          </div>

          <button
            onClick={() => setIsEqualizerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold uppercase text-slate-400 shrink-0 mr-1">Presets:</span>
          {Object.keys(EQUALIZER_PRESETS).map((pName) => (
            <button
              key={pName}
              onClick={() => setEqPreset(pName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                eqPreset === pName
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {pName}
            </button>
          ))}
          <button
            onClick={() => setEqPreset('Flat')}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1 shrink-0 ml-auto"
            title="Reset to Flat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* 10 Faders */}
        <div className="grid grid-cols-10 gap-2 h-64 px-2 py-4 bg-slate-950/50 rounded-2xl border border-white/5">
          {EQUALIZER_FREQUENCIES.map((freq, index) => {
            const gain = eqGains[index] || 0;
            const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;

            return (
              <div key={freq} className="flex flex-col items-center justify-between h-full">
                <span className="text-[11px] font-mono text-slate-400">
                  {gain > 0 ? `+${gain}` : gain}
                </span>

                {/* Vertical Range Slider */}
                <div className="relative flex-1 flex items-center justify-center my-2">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={gain}
                    onChange={(e) => setEqBandGain(index, Number(e.target.value))}
                    className="w-36 -rotate-90 origin-center cursor-pointer accent-blue-500"
                  />
                </div>

                <span className="text-[11px] font-semibold text-slate-300 tracking-tight">
                  {label}Hz
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Gain: ±12 dB with 1.4Q bandwidth</span>
          <button
            onClick={() => setIsEqualizerOpen(false)}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

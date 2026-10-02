/**
 * @license
 * Mehsic Keyboard Shortcuts Modal
 * Laptop-friendly keyboard control reference.
 */

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = usePlayer();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause audio playback' },
    { key: '← / →', desc: 'Seek backward / forward 5 seconds' },
    { key: '↑ / ↓', desc: 'Adjust volume up / down' },
    { key: 'N', desc: 'Next track in queue' },
    { key: 'P', desc: 'Previous track or restart track' },
    { key: 'M', desc: 'Mute / Unmute audio' },
    { key: 'F', desc: 'Favorite / Unfavorite current track' },
    { key: 'Q', desc: 'Open / Close Playback Queue' },
    { key: 'L', desc: 'Open / Close Synced Lyrics' },
    { key: 'Escape', desc: 'Close full-screen Now Playing or modal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0e111a] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/80 flex flex-col space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Laptop Shortcuts</h2>
              <p className="text-xs text-slate-400">Desktop-first media controls</p>
            </div>
          </div>

          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close shortcuts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/3 border border-white/5"
            >
              <span className="text-xs text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-[11px] font-mono font-bold text-blue-400 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

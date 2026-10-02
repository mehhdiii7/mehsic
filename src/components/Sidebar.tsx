/**
 * @license
 * Mehsic Sidebar Navigation (Desktop First)
 */

import React from 'react';
import {
  Home,
  Search,
  Disc,
  Users,
  ListMusic,
  Library,
  Heart,
  ListOrdered,
  Settings,
  Sparkles,
  Sliders,
  Keyboard,
  ShieldCheck,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { ActiveView } from '../types/music';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    playlists,
    setSelectedPlaylist,
    setSelectedAlbum,
    setSelectedArtist,
    playbackQuality,
    streamInfo,
    setIsQualityModalOpen,
    setIsEqualizerOpen,
    setIsShortcutsOpen,
  } = usePlayer();

  const handleNavClick = (view: ActiveView) => {
    setSelectedAlbum(null);
    setSelectedArtist(null);
    setSelectedPlaylist(null);
    setActiveView(view);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'queue', label: 'Queue', icon: ListOrdered },
  ];

  return (
    <aside className="w-64 bg-[#0d0f17] border-r border-white/5 flex flex-col h-full select-none shrink-0 z-20">
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-extrabold text-xl tracking-tight">M</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white">Mehsic</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Audiophile Player</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Discover
          </p>
          <nav className="space-y-1">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as ActiveView)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 font-semibold shadow-sm shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Collection
          </p>
          <nav className="space-y-1">
            {navItems.slice(4).map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as ActiveView)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 font-semibold shadow-sm shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Playlists Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Playlists
            </p>
          </div>
          <div className="space-y-1">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => {
                  setSelectedAlbum(null);
                  setSelectedArtist(null);
                  setSelectedPlaylist(pl);
                  setActiveView('playlists');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors text-left truncate"
              >
                <span className="truncate">{pl.title}</span>
                <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                  {pl.songs.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Engine Quality Card & Utility */}
      <div className="p-3 border-t border-white/5 space-y-2">
        <button
          onClick={() => setIsQualityModalOpen(true)}
          className="w-full p-2.5 rounded-xl bg-slate-900/80 border border-white/8 hover:border-blue-500/30 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Stream Tier
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 capitalize">
              {playbackQuality}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 truncate">
            {streamInfo
              ? `${streamInfo.codec} • ${streamInfo.bitrate}kbps`
              : 'Lossless Pipeline Ready'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {streamInfo?.lossless ? `${streamInfo.bitDepth}-bit / ${streamInfo.sampleRate / 1000}kHz Master` : 'High Bitrate Stream'}
          </p>
        </button>

        <div className="flex items-center gap-1 px-1">
          <button
            onClick={() => setIsEqualizerOpen(true)}
            title="10-Band Equalizer"
            className="flex-1 py-1.5 px-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>EQ</span>
          </button>
          <button
            onClick={() => setIsShortcutsOpen(true)}
            title="Keyboard Shortcuts"
            className="flex-1 py-1.5 px-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Keys</span>
          </button>
          <button
            onClick={() => handleNavClick('settings')}
            title="Settings"
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors ${
              activeView === 'settings' ? 'text-blue-400 bg-blue-500/10' : ''
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

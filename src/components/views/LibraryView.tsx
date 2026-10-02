/**
 * @license
 * Mehsic Library View
 * Central user library with:
 * - Direct links to Favorites, Playlists, Albums, Artists
 * - Verified playback history with timestamps and position
 * - Clear playback history action
 * - SongOptionsMenu integration on all history items
 */

import React, { useState } from 'react';
import {
  Heart,
  ListMusic,
  History,
  Play,
  ShieldCheck,
  Disc,
  Users,
  Trash2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { SongOptionsMenu } from '../SongOptionsMenu';

export const LibraryView: React.FC = () => {
  const {
    favorites,
    favoriteSongs,
    playlists,
    history,
    recentlyPlayed,
    clearPlaybackHistory,
    playSong,
    currentSong,
    setSelectedPlaylist,
    setActiveView,
    isFavorite,
    toggleFavorite,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const formatHistoryTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24 select-none">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Your Library</h1>
        <p className="text-xs text-slate-400 mt-1">
          Your saved music, personal playlists, and verified playback history
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setActiveView('favorites')}
          className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/20 hover:border-rose-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            </div>
            <span className="text-2xl font-extrabold text-white">{favoriteSongs.length}</span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
            Favorite Songs
          </h3>
          <p className="text-xs text-slate-400 mt-1">Saved tracks with lossless audio support</p>
        </div>

        <div
          onClick={() => setActiveView('playlists')}
          className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/20 hover:border-blue-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
              <ListMusic className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-white">{playlists.length}</span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
            Playlists
          </h3>
          <p className="text-xs text-slate-400 mt-1">Custom audio playlists</p>
        </div>

        <div
          onClick={() => setActiveView('albums')}
          className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
              <Disc className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
            Albums
          </h3>
          <p className="text-xs text-slate-400 mt-1">Studio releases and tracklists</p>
        </div>

        <div
          onClick={() => setActiveTab('history')}
          className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-105 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-white">{history.length}</span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
            Playback History
          </h3>
          <p className="text-xs text-slate-400 mt-1">Verified played tracks</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Your Playlists ({playlists.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Playback History ({history.length})
          </button>
        </div>

        {activeTab === 'history' && history.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear your entire playback history?')) {
                clearPlaybackHistory();
              }
            }}
            className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
            title="Clear playback history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => {
                setSelectedPlaylist(pl);
                setActiveView('playlists');
              }}
              className="p-4 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 cursor-pointer transition-all group flex flex-col"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-gradient-to-tr from-slate-900 to-indigo-950/80 border border-white/5 flex items-center justify-center shadow-md">
                {pl.songs[0]?.artwork ? (
                  <img
                    src={pl.songs[0].artwork}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ListMusic className="w-12 h-12 text-blue-400/80 group-hover:scale-110 transition-transform duration-300" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-8 h-8 text-white fill-current ml-0.5" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400">
                {pl.title}
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">{pl.songs.length} tracks</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {history.length > 0 ? (
            <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
              {history.map((item, idx) => {
                const song = item.song;
                const isCurrent = currentSong?.id === song.id;
                const isFav = isFavorite(song.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => playSong(song, recentlyPlayed, idx)}
                    className={`flex items-center justify-between p-3.5 px-6 cursor-pointer transition-colors group ${
                      isCurrent ? 'bg-blue-600/15' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                      <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:hidden shrink-0">
                        {idx + 1}
                      </span>
                      <Play className="w-4 h-4 text-blue-400 fill-current hidden group-hover:block shrink-0" />

                      <img
                        src={song.artwork}
                        alt={song.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isCurrent ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {song.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {song.artist} • {song.album}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-3 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                        {formatHistoryTime(item.timestamp)}
                      </span>

                      {song.availableQualities.includes('lossless') && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                          FLAC
                        </span>
                      )}

                      <button
                        onClick={() => toggleFavorite(song)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                      >
                        <Heart
                          className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`}
                        />
                      </button>

                      <span className="text-xs font-mono text-slate-400 w-10 text-right">
                        {song.durationText}
                      </span>

                      <SongOptionsMenu song={song} align="right" buttonSize="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 space-y-3 bg-white/2 rounded-3xl border border-white/5">
              <History className="w-12 h-12 mx-auto opacity-30 text-indigo-400" />
              <p className="text-base font-semibold text-slate-300">No playback history yet</p>
              <p className="text-xs text-slate-500">
                Songs will be automatically logged to history once played for 3 seconds.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

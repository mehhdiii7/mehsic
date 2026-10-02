/**
 * @license
 * Mehsic Favorites View
 * Consistent favorites library with:
 * - Play all, Shuffle favorites, Add favorites to playlist
 * - Instant synchronization across entire application
 * - Full metadata preservation and SongOptionsMenu
 */

import React, { useState } from 'react';
import {
  Play,
  Heart,
  Shuffle,
  Clock,
  FolderPlus,
  ShieldCheck,
  Music,
  Check,
  ListPlus,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Song, Playlist } from '../../types/music';
import { SongOptionsMenu } from '../SongOptionsMenu';

export const FavoritesView: React.FC = () => {
  const {
    favoriteSongs,
    toggleFavorite,
    playFavorites,
    playSong,
    currentSong,
    addToQueue,
    playlists,
    createPlaylist,
    addSongToPlaylist,
    isFavorite,
    setActiveView,
  } = usePlayer();

  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const totalDurationText = React.useMemo(() => {
    if (favoriteSongs.length === 0) return '0 min';
    const totalSecs = favoriteSongs.reduce((acc, s) => acc + (s.duration || 0), 0);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs > 0) return `${hrs} hr ${mins} min`;
    return `${mins} min`;
  }, [favoriteSongs]);

  const handleAddFavoritesToPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (favoriteSongs.length === 0) return;

    let targetPlId = selectedPlaylistId;
    if (newPlaylistTitle.trim()) {
      const created = createPlaylist(newPlaylistTitle.trim(), 'Exported from Favorites');
      targetPlId = created.id;
    }

    if (!targetPlId) return;

    for (const song of favoriteSongs) {
      addSongToPlaylist(targetPlId, song);
    }

    const plName =
      newPlaylistTitle.trim() ||
      playlists.find((p) => p.id === targetPlId)?.title ||
      'playlist';

    setMessage(`Added all favorites to ${plName}`);
    setShowAddToPlaylistModal(false);
    setNewPlaylistTitle('');
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24 select-none">
      {/* Header Notification */}
      {message && (
        <div className="px-4 py-2 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 bg-gradient-to-t from-rose-950/40 to-transparent p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl bg-gradient-to-br from-rose-600 via-pink-600 to-amber-600 flex items-center justify-center shadow-2xl shadow-rose-950/60 border border-white/10 shrink-0">
          <Heart className="w-20 h-20 text-white fill-white" />
        </div>

        <div className="space-y-3.5 text-center sm:text-left flex-1 min-w-0">
          <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Personal Collection
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Favorite Songs
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-slate-300 font-medium">
            <span>
              {favoriteSongs.length} {favoriteSongs.length === 1 ? 'track' : 'tracks'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{totalDurationText}</span>
          </div>

          {favoriteSongs.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                onClick={() => playFavorites(false)}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all transform hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play All</span>
              </button>

              <button
                onClick={() => playFavorites(true)}
                className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-2 border border-white/10 transition-colors"
                title="Shuffle favorites"
              >
                <Shuffle className="w-4 h-4 text-rose-400" />
                <span>Shuffle</span>
              </button>

              <button
                onClick={() => setShowAddToPlaylistModal(true)}
                className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-2 border border-white/10 transition-colors"
                title="Save favorites to playlist"
              >
                <FolderPlus className="w-4 h-4 text-slate-300" />
                <span>Save to Playlist</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Songs Table */}
      {favoriteSongs.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span># Track</span>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline">Quality</span>
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
            {favoriteSongs.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;

              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, favoriteSongs, idx)}
                  className={`flex items-center justify-between p-3.5 px-5 cursor-pointer transition-colors group ${
                    isCurrent ? 'bg-blue-600/15' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                    <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:hidden shrink-0">
                      {idx + 1}
                    </span>
                    <Play className="w-4 h-4 text-rose-400 fill-current hidden group-hover:block shrink-0" />

                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                      <img src={song.artwork} alt={song.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-rose-400' : 'text-white'
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
                    {song.availableQualities.includes('lossless') && (
                      <span className="hidden sm:inline text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                        FLAC
                      </span>
                    )}

                    <button
                      onClick={() => toggleFavorite(song)}
                      className="p-1 text-rose-500 hover:text-slate-400 transition-colors"
                      title="Remove Favorite"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => addToQueue(song)}
                      className="text-slate-400 hover:text-white transition-colors text-xs font-medium px-2 py-1 rounded bg-white/5 hover:bg-white/10 hidden sm:block"
                    >
                      + Queue
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
        </div>
      ) : (
        <div className="py-24 text-center text-slate-500 space-y-3 bg-white/2 rounded-3xl border border-white/5">
          <Heart className="w-12 h-12 mx-auto opacity-30 text-rose-400" />
          <h3 className="text-base font-semibold text-slate-300">No favorite songs yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any track in search, albums, or the bottom player to build your
            favorites collection.
          </p>
        </div>
      )}

      {/* Add Favorites To Playlist Modal */}
      {showAddToPlaylistModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Save Favorites to Playlist</h3>
            <p className="text-xs text-slate-400">
              Save all {favoriteSongs.length} favorites into an existing playlist or create a new one.
            </p>

            <form onSubmit={handleAddFavoritesToPlaylist} className="space-y-4">
              {playlists.filter((p) => !p.isSystem).length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Choose Playlist</label>
                  <select
                    value={selectedPlaylistId}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose Existing Playlist --</option>
                    {playlists
                      .filter((p) => !p.isSystem)
                      .map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.title} ({pl.songs.length} songs)
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Or Create New Playlist</label>
                <input
                  type="text"
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="e.g. My Best Favorites..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddToPlaylistModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedPlaylistId && !newPlaylistTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  Save Tracks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

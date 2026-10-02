/**
 * @license
 * Mehsic Playlists View
 * Full user playlist management with:
 * - Create, Rename, Delete playlist
 * - Add/remove songs, reorder songs (move up/down)
 * - Play playlist, Shuffle playlist
 * - SongOptionsMenu integration and persistent IndexedDB storage
 */

import React, { useState } from 'react';
import {
  Plus,
  ListMusic,
  Play,
  Shuffle,
  Trash2,
  Edit2,
  ArrowLeft,
  Heart,
  Disc,
  Clock,
  ArrowUp,
  ArrowDown,
  Music,
  Check,
  X,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Playlist, Song } from '../../types/music';
import { SongOptionsMenu } from '../SongOptionsMenu';

export const PlaylistsView: React.FC = () => {
  const {
    playlists,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    removeSongFromPlaylist,
    reorderSongsInPlaylist,
    playPlaylist,
    selectedPlaylist,
    setSelectedPlaylist,
    playSong,
    currentSong,
    isFavorite,
    toggleFavorite,
    addToQueue,
  } = usePlayer();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const pl = createPlaylist(newTitle.trim(), newDescription.trim());
    setNewTitle('');
    setNewDescription('');
    setIsCreating(false);
    setSelectedPlaylist(pl);
  };

  const startEditing = (pl: Playlist) => {
    setEditTitle(pl.title);
    setEditDescription(pl.description || '');
    setIsEditing(true);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylist || !editTitle.trim()) return;
    renamePlaylist(selectedPlaylist.id, editTitle.trim(), editDescription.trim());
    setSelectedPlaylist({
      ...selectedPlaylist,
      title: editTitle.trim(),
      description: editDescription.trim(),
    });
    setIsEditing(false);
  };

  // --- DETAIL VIEW ---
  if (selectedPlaylist) {
    // Keep reference in sync with state
    const currentPl = playlists.find((p) => p.id === selectedPlaylist.id) || selectedPlaylist;

    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24 select-none">
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedPlaylist(null);
            setIsEditing(false);
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Playlists</span>
        </button>

        {/* Playlist Hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center shadow-2xl shadow-black/80 border border-white/10 shrink-0">
            {currentPl.songs[0]?.artwork ? (
              <img
                src={currentPl.songs[0].artwork}
                alt={currentPl.title}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <ListMusic className="w-20 h-20 text-white/80" />
            )}
          </div>

          <div className="space-y-3.5 text-center sm:text-left flex-1 min-w-0">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {currentPl.isSystem ? 'System Playlist' : 'User Playlist'}
            </span>

            {isEditing ? (
              <form onSubmit={handleSaveRename} className="space-y-2 max-w-md">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-xl font-bold text-white focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Playlist description..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/20 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                    {currentPl.title}
                  </h1>
                  {!currentPl.isSystem && (
                    <button
                      onClick={() => startEditing(currentPl)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                      title="Rename playlist"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-300">
                  {currentPl.description || 'Curated personal playlist'}
                </p>
              </>
            )}

            <p className="text-xs text-slate-400 font-medium">
              {currentPl.songs.length} {currentPl.songs.length === 1 ? 'track' : 'tracks'}
            </p>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {currentPl.songs.length > 0 && (
                <>
                  <button
                    onClick={() => playPlaylist(currentPl, false)}
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play Playlist</span>
                  </button>

                  <button
                    onClick={() => playPlaylist(currentPl, true)}
                    className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-2 border border-white/10 transition-colors"
                    title="Shuffle tracks"
                  >
                    <Shuffle className="w-4 h-4 text-blue-400" />
                    <span>Shuffle</span>
                  </button>
                </>
              )}

              {!currentPl.isSystem && (
                <button
                  onClick={() => {
                    deletePlaylist(currentPl.id);
                    setSelectedPlaylist(null);
                  }}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition-colors"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Songs List */}
        {currentPl.songs.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span># Track</span>
              <div className="flex items-center gap-6">
                <span>Actions</span>
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
              {currentPl.songs.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                const isFav = isFavorite(song.id);

                return (
                  <div
                    key={`${song.id}-${idx}`}
                    onClick={() => playSong(song, currentPl.songs, idx)}
                    className={`flex items-center justify-between p-3.5 px-5 cursor-pointer transition-colors group ${
                      isCurrent ? 'bg-blue-600/15' : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Left: Number, Artwork, Title, Artist */}
                    <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                      <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:hidden shrink-0">
                        {idx + 1}
                      </span>
                      <Play className="w-4 h-4 text-blue-400 fill-current hidden group-hover:block shrink-0" />

                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                        <img src={song.artwork} alt={song.title} className="w-full h-full object-cover" />
                      </div>

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

                    {/* Right: Reorder Up/Down, Remove, Duration, Options Menu */}
                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Reorder Buttons */}
                      <button
                        onClick={() => reorderSongsInPlaylist(currentPl.id, idx, Math.max(0, idx - 1))}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          reorderSongsInPlaylist(
                            currentPl.id,
                            idx,
                            Math.min(currentPl.songs.length - 1, idx + 1)
                          )
                        }
                        disabled={idx === currentPl.songs.length - 1}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleFavorite(song)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-1"
                        title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                      >
                        <Heart
                          className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`}
                        />
                      </button>

                      <button
                        onClick={() => removeSongFromPlaylist(currentPl.id, song.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove from Playlist"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <span className="text-xs font-mono text-slate-400 w-10 text-right ml-1">
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
          <div className="py-20 text-center text-slate-500 space-y-3 bg-white/2 rounded-3xl border border-white/5">
            <Music className="w-12 h-12 mx-auto opacity-30 text-blue-400" />
            <h3 className="text-base font-semibold text-slate-300">Playlist is empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Search songs or albums and use the "..." menu on any track to add it to this playlist.
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- PLAYLISTS GRID ---
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ListMusic className="w-7 h-7 text-blue-400" />
            Playlists
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, curate, and organize your personal audio collections
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Playlist</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Playlist Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Midnight Beats, Study Sessions..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add an optional description..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Playlists */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {playlists.map((pl) => (
          <div
            key={pl.id}
            onClick={() => setSelectedPlaylist(pl)}
            className="p-3.5 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 cursor-pointer transition-all group flex flex-col"
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-slate-900 to-indigo-950 border border-white/10 shadow-md flex items-center justify-center">
              {pl.songs[0]?.artwork ? (
                <img
                  src={pl.songs[0].artwork}
                  alt={pl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <ListMusic className="w-12 h-12 text-slate-600 group-hover:text-blue-400 transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Play className="w-8 h-8 text-white fill-current ml-0.5" />
              </div>
            </div>

            <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400">
              {pl.title}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {pl.songs.length} {pl.songs.length === 1 ? 'track' : 'tracks'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

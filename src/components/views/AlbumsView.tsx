/**
 * @license
 * Mehsic Albums View
 * Comprehensive album details view with:
 * - Large artwork, title, artist, year, genre, total duration
 * - Play album, Shuffle album, Add album to queue, Add album to playlist
 * - Tracklist with numbers, titles, artists, durations, play, queue, and SongOptionsMenu
 */

import React, { useEffect, useState } from 'react';
import {
  Play,
  Shuffle,
  ListPlus,
  FolderPlus,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Heart,
  Plus,
  Disc,
  Check,
  Search,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Album, Song, Playlist } from '../../types/music';
import { SongOptionsMenu } from '../SongOptionsMenu';

export const AlbumsView: React.FC = () => {
  const {
    provider,
    playSong,
    currentSong,
    isPlaying,
    selectedAlbum,
    setSelectedAlbum,
    setSelectedArtist,
    setActiveView,
    toggleFavorite,
    isFavorite,
    addToQueue,
    playlists,
    addSongToPlaylist,
    createPlaylist,
  } = usePlayer();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [albumSearch, setAlbumSearch] = useState('');
  const [showAddAlbumModal, setShowAddAlbumModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  // Load curated albums on mount
  useEffect(() => {
    let isCancelled = false;
    Promise.all([
      provider.search('Daft Punk', { filter: 'albums', limit: 4 }),
      provider.search('Coldplay', { filter: 'albums', limit: 4 }),
      provider.search('Hans Zimmer', { filter: 'albums', limit: 4 }),
      provider.search('Master', { filter: 'albums', limit: 4 }),
    ])
      .then((results) => {
        if (!isCancelled) {
          const merged: Album[] = [];
          const seen = new Set<string>();
          for (const res of results) {
            for (const alb of res.albums) {
              if (!seen.has(alb.id)) {
                seen.add(alb.id);
                merged.push(alb);
              }
            }
          }
          setAlbums(merged);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [provider]);

  // Search filter for albums grid
  const filteredAlbums = React.useMemo(() => {
    if (!albumSearch.trim()) return albums;
    const q = albumSearch.toLowerCase();
    return albums.filter(
      (a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );
  }, [albums, albumSearch]);

  // Format total album duration
  const totalDurationText = React.useMemo(() => {
    if (!selectedAlbum || !selectedAlbum.songs || selectedAlbum.songs.length === 0) return null;
    const totalSecs = selectedAlbum.songs.reduce((acc, s) => acc + (s.duration || 0), 0);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs > 0) {
      return `${hrs} hr ${mins} min`;
    }
    return `${mins} min`;
  }, [selectedAlbum]);

  const handlePlayAlbum = (shuffle: boolean = false) => {
    if (!selectedAlbum || selectedAlbum.songs.length === 0) return;
    const list = shuffle
      ? [...selectedAlbum.songs].sort(() => Math.random() - 0.5)
      : [...selectedAlbum.songs];
    playSong(list[0], list, 0);
  };

  const handleAddAlbumToQueue = () => {
    if (!selectedAlbum || selectedAlbum.songs.length === 0) return;
    selectedAlbum.songs.forEach((s) => addToQueue(s));
    setAddedMessage(`Added ${selectedAlbum.songs.length} tracks to queue`);
    setTimeout(() => setAddedMessage(null), 2000);
  };

  const handleAddAlbumToPlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum) return;

    let targetPlId = selectedPlaylistId;
    if (newPlaylistTitle.trim()) {
      const created = createPlaylist(newPlaylistTitle.trim(), `Album: ${selectedAlbum.title}`);
      targetPlId = created.id;
    }

    if (!targetPlId) return;

    for (const s of selectedAlbum.songs) {
      addSongToPlaylist(targetPlId, s);
    }

    const plName =
      newPlaylistTitle.trim() ||
      playlists.find((p) => p.id === targetPlId)?.title ||
      'playlist';

    setAddedMessage(`Added album tracks to ${plName}`);
    setShowAddAlbumModal(false);
    setNewPlaylistTitle('');
    setTimeout(() => setAddedMessage(null), 2500);
  };

  const handleArtistClick = async (artistName: string) => {
    const res = await provider.search(artistName, { filter: 'artists', limit: 3 });
    if (res.artists.length > 0) {
      const full = await provider.getArtist(res.artists[0].id);
      setSelectedArtist(full || res.artists[0]);
    } else {
      setSelectedArtist({
        id: `art_${artistName.replace(/\s+/g, '_').toLowerCase()}`,
        name: artistName,
        artwork: selectedAlbum?.artwork || '',
      });
    }
    setActiveView('artists');
  };

  // --- DETAIL VIEW ---
  if (selectedAlbum) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24 select-none">
        {/* Back Button & Notification */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedAlbum(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Albums</span>
          </button>

          {addedMessage && (
            <div className="px-4 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>{addedMessage}</span>
            </div>
          )}
        </div>

        {/* Album Hero Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 shrink-0 group">
            <img
              src={selectedAlbum.artwork}
              alt={selectedAlbum.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Studio Album
              </span>
              {selectedAlbum.year && (
                <span className="text-xs text-slate-400 font-semibold">• {selectedAlbum.year}</span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {selectedAlbum.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-slate-300 font-medium">
              <span>By</span>
              <button
                onClick={() => handleArtistClick(selectedAlbum.artist)}
                className="text-white hover:text-blue-400 underline font-semibold transition-colors"
              >
                {selectedAlbum.artist}
              </button>
              <span className="text-slate-500">•</span>
              <span>
                {selectedAlbum.songs.length} {selectedAlbum.songs.length === 1 ? 'track' : 'tracks'}
              </span>
              {totalDurationText && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{totalDurationText}</span>
                </>
              )}
            </div>

            {selectedAlbum.description && (
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                {selectedAlbum.description}
              </p>
            )}

            {/* Album Actions Row */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => handlePlayAlbum(false)}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Album</span>
              </button>

              <button
                onClick={() => handlePlayAlbum(true)}
                className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-2 border border-white/10 transition-colors"
                title="Shuffle Album Tracks"
              >
                <Shuffle className="w-4 h-4 text-blue-400" />
                <span>Shuffle</span>
              </button>

              <button
                onClick={handleAddAlbumToQueue}
                className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-2 border border-white/10 transition-colors"
                title="Add All Tracks to Queue"
              >
                <ListPlus className="w-4 h-4 text-slate-300" />
                <span>Add to Queue</span>
              </button>

              <button
                onClick={() => setShowAddAlbumModal(true)}
                className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-2 border border-white/10 transition-colors"
                title="Add Album to Playlist"
              >
                <FolderPlus className="w-4 h-4 text-slate-300" />
                <span>Add to Playlist</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tracklist Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span># Track</span>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline">Format</span>
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
            {selectedAlbum.songs.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              const isFav = isFavorite(song.id);

              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, selectedAlbum.songs, idx)}
                  className={`flex items-center justify-between p-3.5 px-5 cursor-pointer transition-colors group ${
                    isCurrent ? 'bg-blue-600/15' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Left: Number, Title, Artist */}
                  <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                    <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:hidden shrink-0">
                      {idx + 1}
                    </span>
                    <Play className="w-4 h-4 text-blue-400 fill-current hidden group-hover:block shrink-0" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isCurrent ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {song.title}
                        </p>
                        {song.explicit && (
                          <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-white/10 text-slate-400 uppercase">
                            E
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>

                  {/* Right: Quality tag, Favorite, Queue, Duration, Options Menu */}
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
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                    >
                      <Heart
                        className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`}
                      />
                    </button>

                    <button
                      onClick={() => addToQueue(song)}
                      className="text-slate-400 hover:text-white transition-colors text-xs font-medium px-2 py-1 rounded bg-white/5 hover:bg-white/10 hidden sm:block"
                      title="Add track to queue"
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

        {/* Add Album To Playlist Modal */}
        {showAddAlbumModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Add Album to Playlist</h3>
              <p className="text-xs text-slate-400">
                Select an existing playlist or enter a new title to save all {selectedAlbum.songs.length} tracks.
              </p>

              <form onSubmit={handleAddAlbumToPlaylistSubmit} className="space-y-4">
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
                    placeholder="Enter new playlist name..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAlbumModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedPlaylistId && !newPlaylistTitle.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50"
                  >
                    Add All Tracks
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- GRID VIEW ---
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Disc className="w-7 h-7 text-blue-400" />
            Albums
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Studio master releases with lossless audio and full tracklists
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={albumSearch}
            onChange={(e) => setAlbumSearch(e.target.value)}
            placeholder="Filter albums or artists..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-pulse">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-white/3 border border-white/5 space-y-3">
              <div className="aspect-square w-full rounded-xl bg-slate-800/60" />
              <div className="h-4 bg-slate-800/60 rounded w-3/4" />
              <div className="h-3 bg-slate-800/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              onClick={async () => {
                const full = await provider.getAlbum(album.id);
                setSelectedAlbum(full || album);
              }}
              className="p-3.5 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 cursor-pointer transition-all group flex flex-col"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-900 border border-white/5 shadow-md">
                <img
                  src={album.artwork}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-8 h-8 text-white fill-current ml-0.5" />
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400">
                {album.title}
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {album.artist} {album.year ? `• ${album.year}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

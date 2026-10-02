/**
 * @license
 * Mehsic Search View
 * Enhanced search with:
 * - Tabs/categories: All, Songs, Albums, Artists, Playlists
 * - Recent search history with quick-search chips
 * - Clear search history
 * - Debounced catalog queries (no request on every single keypress)
 * - Loading skeletons and rich empty states
 * - Reusable SongOptionsMenu on all tracks
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Play,
  Heart,
  ShieldCheck,
  Disc,
  Users,
  ListMusic,
  Clock,
  History,
  AlertCircle,
  Plus,
  Radio,
  Trash2,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Song, Album, Artist, Playlist, SearchResult } from '../../types/music';
import { SongOptionsMenu } from '../SongOptionsMenu';
import { storageService } from '../../services/storage';

export const SearchView: React.FC = () => {
  const {
    provider,
    playSong,
    currentSong,
    isPlaying,
    togglePlayPause,
    isFavorite,
    toggleFavorite,
    addToQueue,
    playNext,
    setSelectedAlbum,
    setSelectedArtist,
    setSelectedPlaylist,
    setActiveView,
    playlists: userPlaylists,
  } = usePlayer();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'songs' | 'albums' | 'artists' | 'playlists'>('all');
  const [results, setResults] = useState<SearchResult>({
    songs: [],
    albums: [],
    artists: [],
    playlists: [],
  });
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Search History
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    storageService.getSearchHistory()
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Debounced search querying the MusicProvider layer
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ songs: [], albums: [], artists: [], playlists: [] });
      setLoading(false);
      setSearchError(null);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setSearchError(null);

    const timer = setTimeout(() => {
      provider
        .search(trimmed, { filter: filter === 'playlists' ? 'all' : filter, limit: 30 })
        .then((data) => {
          if (!isCancelled) {
            // Include matching user playlists if filtering for all or playlists
            const matchedPlaylists = userPlaylists.filter((pl) =>
              pl.title.toLowerCase().includes(trimmed.toLowerCase())
            );

            setResults({
              ...data,
              playlists: matchedPlaylists,
            });
            setLoading(false);

            // Record to search history if query has at least 3 chars
            if (trimmed.length >= 3) {
              setSearchHistory((prev) => {
                const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
                const updated = [trimmed, ...filtered].slice(0, 20);
                storageService.saveSearchHistory(updated);
                return updated;
              });
            }
          }
        })
        .catch((err: unknown) => {
          if (!isCancelled) {
            const msg = err instanceof Error ? err.message : 'Network search request failed';
            setSearchError(msg);
            setLoading(false);
          }
        });
    }, 280);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, filter, provider, userPlaylists]);

  const handleSelectHistoryItem = (term: string) => {
    setQuery(term);
    searchInputRef.current?.focus();
  };

  const handleClearHistory = () => {
    storageService.clearSearchHistory();
    setSearchHistory([]);
  };

  const filterChips = [
    { id: 'all', label: 'All Results' },
    { id: 'songs', label: 'Songs' },
    { id: 'albums', label: 'Albums' },
    { id: 'artists', label: 'Artists' },
    { id: 'playlists', label: 'Playlists' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24 select-none">
      {/* Search Input Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search global artists, tracks, or albums (e.g. Coldplay, Daft Punk, Aether)..."
          className="w-full pl-12 pr-10 py-3.5 bg-slate-900/90 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all shadow-xl shadow-black/40"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setFilter(chip.id as typeof filter)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              filter === chip.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Recent Search History Chips */}
      {!query && searchHistory.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-blue-400" />
              Recent Searches
            </span>
            <button
              onClick={handleClearHistory}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {searchHistory.map((item) => (
              <button
                key={item}
                onClick={() => handleSelectHistoryItem(item)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-xs font-medium transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error State Banner */}
      {searchError && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Search Error: </span>
            {searchError}
          </div>
          <button
            onClick={() => setSearchError(null)}
            className="text-xs underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-5 bg-slate-800/60 rounded w-28" />
            <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-slate-800/60 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800/60 rounded w-1/3" />
                    <div className="h-3 bg-slate-800/40 rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-slate-800/40 rounded w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Songs Results List */}
          {(filter === 'all' || filter === 'songs') && results.songs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">Songs</h2>
                <span className="text-xs text-slate-500">{results.songs.length} tracks</span>
              </div>

              <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
                {results.songs.map((song, idx) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isFav = isFavorite(song.id);

                  return (
                    <div
                      key={song.id}
                      onClick={() => playSong(song, results.songs, idx)}
                      className={`flex items-center justify-between p-3 px-4 cursor-pointer transition-colors group ${
                        isCurrent ? 'bg-blue-600/15' : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Left: Artwork, Title, Artist, Album */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-4">
                        <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:hidden shrink-0">
                          {idx + 1}
                        </span>
                        <Play className="w-4 h-4 text-blue-400 fill-current hidden group-hover:block shrink-0" />

                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                          <img
                            src={song.artwork}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

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
                          <p className="text-xs text-slate-400 truncate">
                            {song.artist} <span className="text-slate-600">•</span> {song.album}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions, Quality tag, Duration, SongOptionsMenu */}
                      <div
                        className="flex items-center gap-3 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {song.availableQualities.includes('lossless') && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                            <ShieldCheck className="w-3 h-3" />
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
                          className="text-slate-400 hover:text-white transition-colors text-xs font-medium px-2 py-1 rounded bg-white/5 hover:bg-white/10 hidden md:block"
                          title="Add to queue"
                        >
                          + Queue
                        </button>

                        <span className="text-xs font-mono text-slate-400 w-11 text-right">
                          {song.durationText}
                        </span>

                        <SongOptionsMenu song={song} align="right" buttonSize="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Albums Results Grid */}
          {(filter === 'all' || filter === 'albums') && results.albums.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">Albums</h2>
                <span className="text-xs text-slate-500">{results.albums.length} releases</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {results.albums.map((album) => (
                  <div
                    key={album.id}
                    onClick={async () => {
                      const full = await provider.getAlbum(album.id);
                      setSelectedAlbum(full || album);
                      setActiveView('albums');
                    }}
                    className="p-3.5 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 cursor-pointer transition-all group flex flex-col"
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-900 border border-white/5">
                      <img
                        src={album.artwork}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
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
            </section>
          )}

          {/* Artists Results Grid */}
          {(filter === 'all' || filter === 'artists') && results.artists.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">Artists</h2>
                <span className="text-xs text-slate-500">{results.artists.length} artists</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {results.artists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={async () => {
                      const full = await provider.getArtist(artist.id);
                      setSelectedArtist(full || artist);
                      setActiveView('artists');
                    }}
                    className="p-4 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 cursor-pointer transition-all text-center flex flex-col items-center group"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-3 bg-slate-900 border border-white/10 shadow-lg">
                      <img
                        src={artist.artwork}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400">
                      {artist.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Playlists Results Grid */}
          {(filter === 'all' || filter === 'playlists') && results.playlists.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">Matching Playlists</h2>
                <span className="text-xs text-slate-500">{results.playlists.length} playlists</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {results.playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => {
                      setSelectedPlaylist(playlist);
                      setActiveView('playlists');
                    }}
                    className="p-3.5 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 cursor-pointer transition-all group flex flex-col"
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-blue-900 to-indigo-950 border border-white/10 shadow-md flex items-center justify-center">
                      <ListMusic className="w-12 h-12 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400">
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {playlist.songs.length} tracks
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {query.trim() &&
            !loading &&
            results.songs.length === 0 &&
            results.albums.length === 0 &&
            results.artists.length === 0 &&
            results.playlists.length === 0 && (
              <div className="py-24 text-center text-slate-500 space-y-3">
                <Search className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-base font-semibold text-slate-300">
                  No results found for "{query}"
                </p>
                <p className="text-xs text-slate-500">
                  Try searching with broader keywords, artist names, or studio album titles
                </p>
              </div>
            )}

          {/* Initial Search Prompt */}
          {!query.trim() && (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <Radio className="w-12 h-12 mx-auto opacity-20 text-blue-400" />
              <h3 className="text-base font-semibold text-slate-300">Explore the Music Catalog</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Search across millions of songs with official audio streams, high-res covers, and
                studio masters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

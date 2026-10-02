/**
 * @license
 * Mehsic Artists View
 * Comprehensive artist profile with:
 * - Artist banner / avatar, name, genres, listeners, bio
 * - Popular songs with playback, favorite, queue, and SongOptionsMenu
 * - Artist albums and discography
 * - Action buttons: Play all, Shuffle, Open albums
 */

import React, { useEffect, useState } from 'react';
import {
  Play,
  Shuffle,
  Users,
  ArrowLeft,
  Disc,
  Heart,
  ShieldCheck,
  Search,
  Music,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Artist, Album, Song } from '../../types/music';
import { SongOptionsMenu } from '../SongOptionsMenu';

export const ArtistsView: React.FC = () => {
  const {
    provider,
    playSong,
    currentSong,
    isPlaying,
    selectedArtist,
    setSelectedArtist,
    setSelectedAlbum,
    setActiveView,
    toggleFavorite,
    isFavorite,
    addToQueue,
  } = usePlayer();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistSearch, setArtistSearch] = useState('');

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      provider.search('Daft Punk', { filter: 'artists', limit: 3 }),
      provider.search('Coldplay', { filter: 'artists', limit: 3 }),
      provider.search('Hans Zimmer', { filter: 'artists', limit: 3 }),
      provider.search('Aether Collective', { filter: 'artists', limit: 3 }),
      provider.search('Solaris Wave', { filter: 'artists', limit: 3 }),
    ])
      .then((results) => {
        if (!isCancelled) {
          const merged: Artist[] = [];
          const seen = new Set<string>();
          for (const res of results) {
            for (const art of res.artists) {
              if (!seen.has(art.name)) {
                seen.add(art.name);
                merged.push(art);
              }
            }
          }
          setArtists(merged);
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

  const filteredArtists = React.useMemo(() => {
    if (!artistSearch.trim()) return artists;
    const q = artistSearch.toLowerCase();
    return artists.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.genres && a.genres.some((g) => g.toLowerCase().includes(q)))
    );
  }, [artists, artistSearch]);

  const handlePlayArtistSongs = (shuffle: boolean = false) => {
    if (!selectedArtist?.topSongs || selectedArtist.topSongs.length === 0) return;
    const list = shuffle
      ? [...selectedArtist.topSongs].sort(() => Math.random() - 0.5)
      : [...selectedArtist.topSongs];
    playSong(list[0], list, 0);
  };

  const handleAlbumClick = async (album: Album) => {
    const full = await provider.getAlbum(album.id);
    setSelectedAlbum(full || album);
    setActiveView('albums');
  };

  // --- DETAIL VIEW ---
  if (selectedArtist) {
    const topSongs = selectedArtist.topSongs || [];
    const albums = selectedArtist.albums || [];

    return (
      <div className="p-8 space-y-10 max-w-7xl mx-auto pb-24 select-none">
        {/* Back navigation */}
        <button
          onClick={() => setSelectedArtist(null)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Artists</span>
        </button>

        {/* Artist Header Banner */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden shadow-2xl shadow-black/80 border-2 border-white/10 shrink-0 group">
            <img
              src={selectedArtist.artwork}
              alt={selectedArtist.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-3.5 text-center md:text-left flex-1 min-w-0">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Verified Artist
            </span>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {selectedArtist.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-slate-300 font-medium">
              {selectedArtist.genres && selectedArtist.genres.length > 0 && (
                <span>{selectedArtist.genres.join(' • ')}</span>
              )}
              {selectedArtist.monthlyListenersText && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{selectedArtist.monthlyListenersText}</span>
                </>
              )}
            </div>

            {selectedArtist.bio && (
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                {selectedArtist.bio}
              </p>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              {topSongs.length > 0 && (
                <>
                  <button
                    onClick={() => handlePlayArtistSongs(false)}
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play Top Tracks</span>
                  </button>

                  <button
                    onClick={() => handlePlayArtistSongs(true)}
                    className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-2 border border-white/10 transition-colors"
                  >
                    <Shuffle className="w-4 h-4 text-blue-400" />
                    <span>Shuffle</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Popular Songs */}
        {topSongs.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Popular Songs</h2>

            <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
              {topSongs.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                const isFav = isFavorite(song.id);

                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, topSongs, idx)}
                    className={`flex items-center justify-between p-3.5 px-5 cursor-pointer transition-colors group ${
                      isCurrent ? 'bg-blue-600/15' : 'hover:bg-white/5'
                    }`}
                  >
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
                        <p className="text-xs text-slate-400 truncate mt-0.5">{song.album}</p>
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
          </section>
        )}

        {/* Albums & Discography */}
        {albums.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Discography & Albums</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => handleAlbumClick(album)}
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
                      <Disc className="w-8 h-8 text-white ml-0.5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400">
                    {album.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {album.year ? `${album.year} • ` : ''}
                    {album.trackCount ? `${album.trackCount} tracks` : 'Album'}
                  </p>
                </div>
              ))}
            </div>
          </section>
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
            <Users className="w-7 h-7 text-indigo-400" />
            Artists
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse artists, listen to top tracks, and explore full discographies
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={artistSearch}
            onChange={(e) => setArtistSearch(e.target.value)}
            placeholder="Search artists..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-pulse">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col items-center space-y-3">
              <div className="w-24 h-24 rounded-full bg-slate-800/60" />
              <div className="h-4 bg-slate-800/60 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredArtists.map((artist) => (
            <div
              key={artist.name}
              onClick={async () => {
                const full = await provider.getArtist(artist.id);
                setSelectedArtist(full || artist);
              }}
              className="p-4 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 cursor-pointer transition-all text-center flex flex-col items-center group"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden mb-3 bg-slate-900 border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  src={artist.artwork}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <h3 className="text-sm font-semibold text-white truncate w-full group-hover:text-blue-400">
                {artist.name}
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

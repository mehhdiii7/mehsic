/**
 * @license
 * Mehsic Home View
 * Features:
 * - Recently played tracks (verified actual playback)
 * - Recently played artists & albums
 * - Favorite songs shelf
 * - Recently added tracks
 * - Verified recommendations (if available from provider)
 * - Reusable context menu for all tracks
 */

import React from 'react';
import {
  Play,
  Heart,
  Clock,
  Disc,
  Users,
  Sparkles,
  ChevronRight,
  Shuffle,
  ShieldCheck,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Song, Album, Artist } from '../../types/music';
import { SongOptionsMenu } from '../SongOptionsMenu';

export const HomeView: React.FC = () => {
  const {
    recentlyPlayed,
    history,
    favoriteSongs,
    playSong,
    currentSong,
    isPlaying,
    togglePlayPause,
    setSelectedAlbum,
    setSelectedArtist,
    setActiveView,
    toggleFavorite,
    isFavorite,
    playFavorites,
    provider,
  } = usePlayer();

  // Extract recently played unique artists from history
  const recentlyPlayedArtists = React.useMemo(() => {
    const artistMap = new Map<string, { name: string; artwork: string }>();
    for (const item of history) {
      if (!artistMap.has(item.song.artist)) {
        artistMap.set(item.song.artist, {
          name: item.song.artist,
          artwork: item.song.artwork,
        });
      }
      if (artistMap.size >= 8) break;
    }
    return Array.from(artistMap.entries()).map(([name, data]) => ({
      name,
      artwork: data.artwork,
    }));
  }, [history]);

  // Extract recently played unique albums from history
  const recentlyPlayedAlbums = React.useMemo(() => {
    const albumMap = new Map<
      string,
      { title: string; artist: string; artwork: string; albumId: string }
    >();
    for (const item of history) {
      if (item.song.album && !albumMap.has(item.song.album)) {
        albumMap.set(item.song.album, {
          title: item.song.album,
          artist: item.song.artist,
          artwork: item.song.artwork,
          albumId: item.song.albumId || `alb_${item.song.id}`,
        });
      }
      if (albumMap.size >= 8) break;
    }
    return Array.from(albumMap.values());
  }, [history]);

  // Recently added: latest added to favorites or library
  const recentlyAdded = React.useMemo(() => {
    return favoriteSongs.slice(0, 10);
  }, [favoriteSongs]);

  const handleOpenArtist = async (artistName: string, artwork: string) => {
    const res = await provider.search(artistName, { filter: 'artists', limit: 3 });
    if (res.artists.length > 0) {
      const full = await provider.getArtist(res.artists[0].id);
      setSelectedArtist(full || res.artists[0]);
    } else {
      setSelectedArtist({
        id: `art_${artistName.replace(/\s+/g, '_').toLowerCase()}`,
        name: artistName,
        artwork,
      });
    }
    setActiveView('artists');
  };

  const handleOpenAlbum = async (albumTitle: string, albumId: string, artwork: string, artist: string) => {
    const full = await provider.getAlbum(albumId);
    if (full) {
      setSelectedAlbum(full);
    } else {
      setSelectedAlbum({
        id: albumId,
        title: albumTitle,
        artist,
        artwork,
        songs: [],
      });
    }
    setActiveView('albums');
  };

  const heroTrack = recentlyPlayed[0] || favoriteSongs[0];

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto pb-24 select-none">
      {/* Hero Welcome / Now Spinning Spotlight */}
      {heroTrack ? (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-blue-950/70 via-indigo-950/40 to-slate-950/80 p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-3.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {currentSong ? 'Now Playing' : 'Jump Back In'}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight line-clamp-2">
              {heroTrack.title}
            </h1>

            <p className="text-base text-slate-300 font-medium">
              By {heroTrack.artist} • {heroTrack.album}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {heroTrack.availableQualities.includes('lossless') ? (
                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Studio Master FLAC
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  High Definition AAC
                </span>
              )}
              <span className="text-xs text-slate-400">{heroTrack.durationText}</span>
            </div>

            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => {
                  if (currentSong?.id === heroTrack.id) {
                    togglePlayPause();
                  } else {
                    playSong(heroTrack, recentlyPlayed.length > 0 ? recentlyPlayed : favoriteSongs);
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{currentSong?.id === heroTrack.id && isPlaying ? 'Pause' : 'Play Track'}</span>
              </button>

              <button
                onClick={() => toggleFavorite(heroTrack)}
                className={`p-3 rounded-2xl border transition-colors ${
                  isFavorite(heroTrack.id)
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
                }`}
                title={isFavorite(heroTrack.id) ? 'Favorited' : 'Add to Favorites'}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite(heroTrack.id) ? 'fill-current' : ''}`}
                />
              </button>

              <SongOptionsMenu song={heroTrack} align="left" />
            </div>
          </div>

          <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 shrink-0 group-hover:scale-105 transition-transform duration-300">
            <img
              src={heroTrack.artwork}
              alt={heroTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 to-blue-950/40 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Welcome to Mehsic</h1>
            <p className="text-sm text-slate-400 max-w-lg">
              A high-fidelity laptop-first web music player. Search any artist, stream lossless
              masters, organize playlists, and enjoy gapless playback.
            </p>
          </div>
          <button
            onClick={() => setActiveView('search')}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 transition-all"
          >
            Explore Catalog
          </button>
        </div>
      )}

      {/* 1. Recently Played Tracks (Real Playback History) */}
      {recentlyPlayed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Recently Played</h2>
            </div>
            <button
              onClick={() => setActiveView('library')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentlyPlayed.slice(0, 6).map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              const isFav = isFavorite(song.id);

              return (
                <div
                  key={`${song.id}-${idx}`}
                  onClick={() => playSong(song, recentlyPlayed, idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                    isCurrent
                      ? 'bg-blue-600/15 border-blue-500/40'
                      : 'bg-white/3 hover:bg-white/7 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-2">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                      <img
                        src={song.artwork}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-blue-400' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleFavorite(song)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                    >
                      <Heart
                        className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`}
                      />
                    </button>
                    <SongOptionsMenu song={song} align="right" buttonSize="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Recently Played Artists */}
      {recentlyPlayedArtists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Artists</h2>
            </div>
            <button
              onClick={() => setActiveView('artists')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>All Artists</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {recentlyPlayedArtists.map((artist) => (
              <div
                key={artist.name}
                onClick={() => handleOpenArtist(artist.name, artist.artwork)}
                className="p-3 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 cursor-pointer transition-all flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mb-2.5 bg-slate-900 border border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={artist.artwork}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="text-xs font-semibold text-white truncate w-full group-hover:text-blue-400">
                  {artist.name}
                </p>
                <span className="text-[10px] text-slate-500 mt-0.5">Artist</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Recently Played Albums */}
      {recentlyPlayedAlbums.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Albums</h2>
            </div>
            <button
              onClick={() => setActiveView('albums')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>All Albums</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyPlayedAlbums.map((album) => (
              <div
                key={album.title}
                onClick={() => handleOpenAlbum(album.title, album.albumId, album.artwork, album.artist)}
                className="p-3 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 cursor-pointer transition-all group flex flex-col"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2.5 bg-slate-900 border border-white/10 shadow-md">
                  <img
                    src={album.artwork}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xs font-semibold text-white truncate group-hover:text-blue-400">
                  {album.title}
                </h3>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{album.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Favorite Songs Shelf */}
      {favoriteSongs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h2 className="text-xl font-bold text-white tracking-tight">Favorite Songs</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => playFavorites(true)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all font-semibold"
              >
                <Shuffle className="w-3 h-3" />
                <span>Shuffle Favorites</span>
              </button>
              <button
                onClick={() => setActiveView('favorites')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View All ({favoriteSongs.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
            {favoriteSongs.slice(0, 5).map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;

              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, favoriteSongs, idx)}
                  className={`flex items-center justify-between p-3.5 px-5 cursor-pointer transition-colors group ${
                    isCurrent ? 'bg-blue-600/15' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-4">
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
                      <p className="text-xs text-slate-400 truncate">
                        {song.artist} • {song.album}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleFavorite(song)}
                      className="p-1 text-rose-500 hover:text-slate-400 transition-colors"
                      title="Remove Favorite"
                    >
                      <Heart className="w-4 h-4 fill-current" />
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

      {/* 5. Recently Added Shelf */}
      {recentlyAdded.length > 5 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Recently Added to Library</h2>
            <button
              onClick={() => setActiveView('library')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View Library</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentlyAdded.slice(0, 5).map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song, recentlyAdded)}
                className="p-3.5 rounded-2xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/15 cursor-pointer transition-all group flex flex-col"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-900 border border-white/10 shadow-md">
                  <img
                    src={song.artwork}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                  </div>
                </div>

                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-white truncate group-hover:text-blue-400">
                      {song.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{song.artist}</p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <SongOptionsMenu song={song} align="right" buttonSize="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

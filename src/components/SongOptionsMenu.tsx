/**
 * @license
 * Mehsic Reusable Song Options Menu
 * Centralized context menu component for:
 * - Play next
 * - Add to queue
 * - Add to playlist (with inline creation)
 * - Favorite / Unfavorite
 * - Go to album
 * - Go to artist
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Play,
  ListPlus,
  Plus,
  Heart,
  Disc,
  Users,
  Check,
  FolderPlus,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Song, Playlist } from '../types/music';

interface SongOptionsMenuProps {
  song: Song;
  className?: string;
  align?: 'left' | 'right';
  buttonSize?: 'sm' | 'md';
}

export const SongOptionsMenu: React.FC<SongOptionsMenuProps> = ({
  song,
  className = '',
  align = 'right',
  buttonSize = 'md',
}) => {
  const {
    playNext,
    addToQueue,
    playlists,
    addSongToPlaylist,
    createPlaylist,
    favorites,
    toggleFavorite,
    setSelectedAlbum,
    setSelectedArtist,
    setActiveView,
    provider,
  } = usePlayer();

  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [addedNotification, setAddedNotification] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const isFav = favorites.includes(song.id);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowPlaylistSubmenu(false);
        setIsCreatingPlaylist(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowPlaylistSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePlayNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playNext(song);
    setIsOpen(false);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
    setIsOpen(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(song);
  };

  const handleAddToPlaylist = (e: React.MouseEvent, pl: Playlist) => {
    e.stopPropagation();
    addSongToPlaylist(pl.id, song);
    setAddedNotification(`Added to ${pl.title}`);
    setTimeout(() => {
      setAddedNotification(null);
      setIsOpen(false);
      setShowPlaylistSubmenu(false);
    }, 900);
  };

  const handleCreateNewPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const newPl = createPlaylist(newPlaylistName.trim());
    addSongToPlaylist(newPl.id, song);
    setNewPlaylistName('');
    setIsCreatingPlaylist(false);
    setAddedNotification(`Created & added to ${newPl.title}`);
    setTimeout(() => {
      setAddedNotification(null);
      setIsOpen(false);
      setShowPlaylistSubmenu(false);
    }, 900);
  };

  const handleGoToAlbum = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (song.albumId) {
      const album = await provider.getAlbum(song.albumId);
      if (album) {
        setSelectedAlbum(album);
      } else {
        setSelectedAlbum({
          id: song.albumId,
          title: song.album,
          artist: song.artist,
          artwork: song.artwork,
          songs: [song],
        });
      }
    } else {
      setSelectedAlbum({
        id: `alb_${song.id}`,
        title: song.album,
        artist: song.artist,
        artwork: song.artwork,
        songs: [song],
      });
    }
    setActiveView('albums');
  };

  const handleGoToArtist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    // Find or lookup artist
    const res = await provider.search(song.artist, { filter: 'artists', limit: 3 });
    if (res.artists.length > 0) {
      const found = await provider.getArtist(res.artists[0].id);
      setSelectedArtist(found || res.artists[0]);
    } else {
      setSelectedArtist({
        id: `art_${song.artist.replace(/\s+/g, '_').toLowerCase()}`,
        name: song.artist,
        artwork: song.artwork,
        topSongs: [song],
      });
    }
    setActiveView('artists');
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowPlaylistSubmenu(false);
        }}
        className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none ${
          buttonSize === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
        }`}
        title="More options"
      >
        <MoreVertical className={buttonSize === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5'} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-full mt-1.5 z-50 min-w-[210px] bg-[#12141e]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80 py-2 text-xs font-medium text-slate-200 divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {addedNotification ? (
            <div className="px-4 py-3 text-center text-blue-400 font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{addedNotification}</span>
            </div>
          ) : showPlaylistSubmenu ? (
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/5 px-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Add to Playlist
                </span>
                <button
                  onClick={() => setShowPlaylistSubmenu(false)}
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Back
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {playlists
                  .filter((p) => !p.isSystem)
                  .map((pl) => {
                    const alreadyIn = pl.songs.some((s) => s.id === song.id);
                    return (
                      <button
                        key={pl.id}
                        onClick={(e) => handleAddToPlaylist(e, pl)}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 flex items-center justify-between group transition-colors"
                      >
                        <span className="truncate">{pl.title}</span>
                        {alreadyIn ? (
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-slate-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>

              {isCreatingPlaylist ? (
                <form onSubmit={handleCreateNewPlaylist} className="pt-1 space-y-1.5">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="New playlist name..."
                    autoFocus
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsCreatingPlaylist(false)}
                      className="px-2 py-1 text-[10px] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newPlaylistName.trim()}
                      className="px-2.5 py-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                      Create & Add
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreatingPlaylist(true)}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-400 font-semibold flex items-center gap-2 transition-colors mt-1"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>New Playlist</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Primary Playback Queue Actions */}
              <div className="py-1">
                <button
                  onClick={handlePlayNext}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-blue-400" />
                  <span>Play Next</span>
                </button>
                <button
                  onClick={handleAddToQueue}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                >
                  <ListPlus className="w-3.5 h-3.5 text-slate-300" />
                  <span>Add to Queue</span>
                </button>
              </div>

              {/* Playlist & Favorites */}
              <div className="py-1">
                <button
                  onClick={() => setShowPlaylistSubmenu(true)}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-3.5 h-3.5 text-slate-300" />
                    <span>Add to Playlist...</span>
                  </div>
                  <span className="text-[10px] text-slate-500">▶</span>
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                    }`}
                  />
                  <span>{isFav ? 'Remove Favorite' : 'Save to Favorites'}</span>
                </button>
              </div>

              {/* Navigation to Album / Artist */}
              <div className="py-1">
                {song.album && (
                  <button
                    onClick={handleGoToAlbum}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    <Disc className="w-3.5 h-3.5 text-slate-300" />
                    <span className="truncate">Go to Album</span>
                  </button>
                )}
                {song.artist && (
                  <button
                    onClick={handleGoToArtist}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-300" />
                    <span className="truncate">Go to Artist</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

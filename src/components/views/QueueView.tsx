/**
 * @license
 * Mehsic Playback Queue View
 * Full queue management with:
 * - Currently playing status with audio quality badge
 * - Upcoming queue list
 * - Reorder items (Move Up / Down)
 * - Remove individual track
 * - Clear upcoming queue (preserving currently playing track)
 * - Play specific queued song
 * - Save queue as playlist
 * - SongOptionsMenu integration
 */

import React, { useState } from 'react';
import {
  Play,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  ListOrdered,
  FolderPlus,
  Heart,
  Check,
  X,
  Music,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Song, Playlist } from '../../types/music';
import { SongOptionsMenu } from '../SongOptionsMenu';

export const QueueView: React.FC = () => {
  const {
    queue,
    currentIndex,
    currentSong,
    playQueueIndex,
    removeFromQueue,
    clearQueue,
    moveQueueItem,
    saveQueueAsPlaylist,
    streamInfo,
    isFavorite,
    toggleFavorite,
  } = usePlayer();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const currentTrack = currentSong;
  const upcomingTracks = queue.slice(currentIndex + 1);

  const handleSaveAsPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistTitle.trim() || queue.length === 0) return;
    const pl = saveQueueAsPlaylist(playlistTitle.trim());
    setNotification(`Saved queue to "${pl.title}"`);
    setShowSaveModal(false);
    setPlaylistTitle('');
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto pb-24 select-none">
      {/* Header Notification */}
      {notification && (
        <div className="px-4 py-2 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ListOrdered className="w-7 h-7 text-blue-400" />
            Playback Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {queue.length} {queue.length === 1 ? 'track' : 'tracks'} in playback sequence
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {queue.length > 0 && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all"
              title="Save current queue to a playlist"
            >
              <FolderPlus className="w-4 h-4 text-blue-400" />
              <span>Save as Playlist</span>
            </button>
          )}

          {upcomingTracks.length > 0 && (
            <button
              onClick={clearQueue}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all"
              title="Clear upcoming songs while keeping current song"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Upcoming</span>
            </button>
          )}
        </div>
      </div>

      {/* Currently Playing Section */}
      {currentTrack ? (
        <section className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Currently Playing
          </span>

          <div className="p-4 rounded-2xl bg-blue-600/15 border border-blue-500/40 flex items-center justify-between shadow-lg shadow-blue-500/5">
            <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
              <img
                src={currentTrack.artwork}
                alt={currentTrack.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-slate-300 truncate mt-0.5">
                  {currentTrack.artist} • {currentTrack.album}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 uppercase">
                    Active
                  </span>
                  {streamInfo?.lossless && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {streamInfo.codec}
                    </span>
                  )}
                  {streamInfo && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {streamInfo.bitrate} kbps
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => toggleFavorite(currentTrack)}
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                title={isFavorite(currentTrack.id) ? 'Remove Favorite' : 'Save Favorite'}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite(currentTrack.id) ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>

              <span className="text-xs font-mono text-blue-300 font-semibold w-10 text-right">
                {currentTrack.durationText}
              </span>

              <SongOptionsMenu song={currentTrack} align="right" buttonSize="sm" />
            </div>
          </div>
        </section>
      ) : (
        <div className="p-8 text-center bg-white/2 rounded-2xl border border-white/5 text-slate-400 text-sm">
          No song currently playing. Search or select a song to begin playback.
        </div>
      )}

      {/* Next Up (Upcoming Queue) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Next In Queue ({upcomingTracks.length})
          </span>
        </div>

        {upcomingTracks.length > 0 ? (
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-lg">
            {upcomingTracks.map((song, relIdx) => {
              const absIdx = currentIndex + 1 + relIdx;
              const isFav = isFavorite(song.id);

              return (
                <div
                  key={`${song.id}-${absIdx}`}
                  onClick={() => playQueueIndex(absIdx)}
                  className="flex items-center justify-between p-3.5 px-5 cursor-pointer hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                    <span className="w-6 text-center text-xs font-mono text-slate-500 group-hover:hidden shrink-0">
                      {relIdx + 1}
                    </span>
                    <Play className="w-4 h-4 text-blue-400 fill-current hidden group-hover:block shrink-0" />

                    <img
                      src={song.artwork}
                      alt={song.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{song.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {song.artist} • {song.album}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Move Up / Down Buttons */}
                    <button
                      onClick={() => moveQueueItem(absIdx, 'up')}
                      disabled={absIdx === currentIndex + 1}
                      className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move Up in Queue"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => moveQueueItem(absIdx, 'down')}
                      disabled={absIdx === queue.length - 1}
                      className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move Down in Queue"
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
                      onClick={() => removeFromQueue(absIdx)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove from Queue"
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
        ) : (
          <div className="py-16 text-center text-slate-500 space-y-2 bg-white/2 rounded-2xl border border-white/5">
            <Music className="w-10 h-10 mx-auto opacity-30 text-blue-400" />
            <p className="text-sm font-semibold text-slate-300">No upcoming tracks</p>
            <p className="text-xs text-slate-500">
              Add songs from search, albums, or artists to queue them up next.
            </p>
          </div>
        )}
      </section>

      {/* Save Queue As Playlist Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Save Queue as Playlist</h3>
            <p className="text-xs text-slate-400">
              Create a new playlist containing all {queue.length} tracks currently in the queue.
            </p>

            <form onSubmit={handleSaveAsPlaylist} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Playlist Name</label>
                <input
                  type="text"
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  placeholder="e.g. Queue Mix - March..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!playlistTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  Save Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

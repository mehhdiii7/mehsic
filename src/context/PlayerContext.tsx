/**
 * @license
 * Mehsic Centralized Player State & Context
 * Decoupled from specific music providers.
 * Integrated with IndexedDB storageService for favorites, playlists, and true playback history.
 * Enhanced with full desktop playback controls, configurable lyrics, and persistent preferences.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Song,
  Album,
  Artist,
  Playlist,
  PlaybackQuality,
  RepeatMode,
  StreamInfo,
  ActiveView,
  LyricLine,
} from '../types/music';
import { globalAudioEngine, EQUALIZER_PRESETS } from '../services/audioEngine';
import { MusicProvider } from '../providers/MusicProvider';
import { ApiMusicProvider } from '../providers/ApiMusicProvider';
import { storageService, PlaybackHistoryItem } from '../services/storage';
import { defaultLyricsProvider } from '../providers/LrcLibLyricsProvider';
import { LyricsProvider } from '../providers/LyricsProvider';

interface PlayerContextType {
  // Centralized player state
  currentSong: Song | null;
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  playbackQuality: PlaybackQuality;
  streamInfo: StreamInfo | null;
  bufferedFraction: number;
  isMuted: boolean;
  error: string | null;
  clearError: () => void;

  // Stored user library state
  favorites: string[]; // Song IDs
  favoriteSongs: Song[]; // Full Song objects
  isFavorite: (songId: string) => boolean;
  playlists: Playlist[];
  history: PlaybackHistoryItem[];
  recentlyPlayed: Song[];
  clearPlaybackHistory: () => Promise<void>;

  // Lyrics state
  lyrics: LyricLine[] | null;
  syncedLyrics: LyricLine[] | null;
  plainLyrics: string | null;
  isLoadingLyrics: boolean;
  lyricsProvider: LyricsProvider;

  // Navigation & Modals
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedAlbum: Album | null;
  setSelectedAlbum: (album: Album | null) => void;
  selectedArtist: Artist | null;
  setSelectedArtist: (artist: Artist | null) => void;
  selectedPlaylist: Playlist | null;
  setSelectedPlaylist: (playlist: Playlist | null) => void;

  isNowPlayingOpen: boolean;
  setIsNowPlayingOpen: (open: boolean) => void;
  isLyricsOpen: boolean;
  setIsLyricsOpen: (open: boolean) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  isEqualizerOpen: boolean;
  setIsEqualizerOpen: (open: boolean) => void;
  isQualityModalOpen: boolean;
  setIsQualityModalOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;

  // Preferences & Interface Settings
  dynamicArtworkEnabled: boolean;
  setDynamicArtworkEnabled: (enabled: boolean) => void;
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  crossfade: number;
  setCrossfade: (seconds: number) => void;
  gapless: boolean;
  setGapless: (gapless: boolean) => void;

  // Equalizer
  eqGains: number[];
  eqPreset: string;
  setEqBandGain: (bandIndex: number, gainDb: number) => void;
  setEqPreset: (presetName: string) => void;

  // Playback Operations
  playSong: (song: Song, contextQueue?: Song[], startIndex?: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => void;
  previous: () => void;
  next: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setPlaybackQuality: (quality: PlaybackQuality) => void;

  // Queue Operations
  addToQueue: (song: Song) => void;
  playNext: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  moveQueueItem: (index: number, direction: 'up' | 'down') => void;
  playQueueIndex: (index: number) => void;
  saveQueueAsPlaylist: (title: string) => Playlist;

  // Library & Playlist Operations
  toggleFavorite: (song: Song) => void;
  playFavorites: (shouldShuffle?: boolean) => void;
  createPlaylist: (title: string, description?: string) => Playlist;
  renamePlaylist: (playlistId: string, title: string, description?: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  reorderSongsInPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  deletePlaylist: (playlistId: string) => void;
  playPlaylist: (playlist: Playlist, shouldShuffle?: boolean) => void;

  // Provider
  provider: MusicProvider;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const STORAGE_KEY_QUALITY = 'mehsic_quality_setting';
const STORAGE_KEY_VOLUME = 'mehsic_volume';
const STORAGE_KEY_DYN_ARTWORK = 'mehsic_dyn_artwork';
const STORAGE_KEY_COMPACT = 'mehsic_compact';
const STORAGE_KEY_ANIMATIONS = 'mehsic_animations';
const STORAGE_KEY_CROSSFADE = 'mehsic_crossfade';
const STORAGE_KEY_GAPLESS = 'mehsic_gapless';

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Concrete music & lyrics providers
  const provider = useMemo<MusicProvider>(() => new ApiMusicProvider(), []);
  const lyricsProvider = useMemo<LyricsProvider>(() => defaultLyricsProvider, []);

  // Centralized player state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Volume with localStorage persistence
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (saved) return Math.max(0, Math.min(1, parseFloat(saved)));
    } catch {
      // Ignore
    }
    return 0.85;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [playbackQuality, setPlaybackQualityState] = useState<PlaybackQuality>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUALITY);
      if (saved && ['auto', 'high', 'very_high', 'lossless'].includes(saved)) {
        return saved as PlaybackQuality;
      }
    } catch {
      // Ignore
    }
    return 'auto';
  });

  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [bufferedFraction, setBufferedFraction] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Lyrics state
  const [syncedLyrics, setSyncedLyrics] = useState<LyricLine[] | null>(null);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

  // Preferences & Settings State
  const [dynamicArtworkEnabled, setDynamicArtworkEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_DYN_ARTWORK) !== 'false';
    } catch {
      return true;
    }
  });

  const [compactMode, setCompactModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_COMPACT) === 'true';
    } catch {
      return false;
    }
  });

  const [animationsEnabled, setAnimationsEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ANIMATIONS) !== 'false';
    } catch {
      return true;
    }
  });

  const [crossfade, setCrossfadeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CROSSFADE);
      return saved ? parseInt(saved, 10) : 2;
    } catch {
      return 2;
    }
  });

  const [gapless, setGaplessState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_GAPLESS) !== 'false';
    } catch {
      return true;
    }
  });

  const setDynamicArtworkEnabled = useCallback((enabled: boolean) => {
    setDynamicArtworkEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_DYN_ARTWORK, enabled.toString());
    } catch {}
  }, []);

  const setCompactMode = useCallback((compact: boolean) => {
    setCompactModeState(compact);
    try {
      localStorage.setItem(STORAGE_KEY_COMPACT, compact.toString());
    } catch {}
  }, []);

  const setAnimationsEnabled = useCallback((enabled: boolean) => {
    setAnimationsEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_ANIMATIONS, enabled.toString());
    } catch {}
  }, []);

  const setCrossfade = useCallback((seconds: number) => {
    setCrossfadeState(seconds);
    try {
      localStorage.setItem(STORAGE_KEY_CROSSFADE, seconds.toString());
    } catch {}
  }, []);

  const setGapless = useCallback((gaplessVal: boolean) => {
    setGaplessState(gaplessVal);
    try {
      localStorage.setItem(STORAGE_KEY_GAPLESS, gaplessVal.toString());
    } catch {}
  }, []);

  // User Data State (loaded from storageService)
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<PlaybackHistoryItem[]>([]);

  // Navigation & Modals
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Equalizer
  const [eqPreset, setEqPresetState] = useState<string>('Flat');
  const [eqGains, setEqGains] = useState<number[]>(EQUALIZER_PRESETS['Flat']);

  // Ref to prevent duplicate history logging per track run
  const hasLoggedHistoryForCurrentSongRef = useRef<string | null>(null);

  // Hydrate user data from persistent storage on mount
  useEffect(() => {
    let isMounted = true;

    storageService.getFavorites().then((favs) => {
      if (!isMounted) return;
      if (favs.length > 0) {
        setFavoriteSongs(favs);
        setFavorites(favs.map((s) => s.id));
      } else {
        provider.getSong('audio_flac_1').then((s) => {
          if (s && isMounted) {
            setFavoriteSongs([s]);
            setFavorites([s.id]);
            storageService.saveFavorites([s]);
          }
        });
      }
    });

    storageService.getPlaylists().then((pls) => {
      if (!isMounted) return;
      setPlaylists(pls);
    });

    storageService.getHistory().then((hist) => {
      if (!isMounted) return;
      setHistory(hist);
    });

    return () => {
      isMounted = false;
    };
  }, [provider]);

  // Derived recently played songs list
  const recentlyPlayed = useMemo(() => {
    const seen = new Set<string>();
    const list: Song[] = [];
    for (const h of history) {
      if (!seen.has(h.song.id)) {
        seen.add(h.song.id);
        list.push(h.song);
      }
      if (list.length >= 30) break;
    }
    return list;
  }, [history]);

  const isFavorite = useCallback(
    (songId: string) => {
      return favorites.includes(songId);
    },
    [favorites]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Connect AudioEngine listeners
  useEffect(() => {
    globalAudioEngine.setTimeUpdateListener((time, dur, buf) => {
      setCurrentTime(time);
      setDuration(dur);
      setBufferedFraction(buf);
    });

    globalAudioEngine.setStateChangeListener((playing, loading) => {
      setIsPlaying(playing);
      setIsLoading(loading);
      if (playing) setError(null);
    });

    globalAudioEngine.setErrorListener((err) => {
      setError(err);
      setIsPlaying(false);
      setIsLoading(false);
    });
  }, []);

  // Real Playback Tracking: logs to history after sustained 3s of playback
  useEffect(() => {
    if (!currentSong || !isPlaying || currentTime < 3) {
      return;
    }

    if (hasLoggedHistoryForCurrentSongRef.current === currentSong.id) {
      return;
    }

    hasLoggedHistoryForCurrentSongRef.current = currentSong.id;

    const newRecord: PlaybackHistoryItem = {
      id: `hist_${Date.now()}_${currentSong.id}`,
      song: currentSong,
      timestamp: Date.now(),
      playbackPosition: Math.round(currentTime),
    };

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.song.id !== currentSong.id);
      const updated = [newRecord, ...filtered].slice(0, 100);
      storageService.saveHistory(updated);
      return updated;
    });
  }, [currentSong, isPlaying, currentTime]);

  const clearPlaybackHistory = useCallback(async () => {
    setHistory([]);
    await storageService.clearHistory();
  }, []);

  // Fetch lyrics through LyricsProvider abstraction
  useEffect(() => {
    if (!currentSong) {
      setSyncedLyrics(null);
      setPlainLyrics(null);
      setLyrics(null);
      hasLoggedHistoryForCurrentSongRef.current = null;
      return;
    }

    hasLoggedHistoryForCurrentSongRef.current = null;
    let isMounted = true;
    setIsLoadingLyrics(true);

    Promise.all([
      lyricsProvider.getSyncedLyrics(currentSong),
      lyricsProvider.getLyrics(currentSong),
    ])
      .then(([synced, plain]) => {
        if (isMounted) {
          setSyncedLyrics(synced);
          setPlainLyrics(plain);
          setLyrics(synced);
          setIsLoadingLyrics(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSyncedLyrics(null);
          setPlainLyrics(null);
          setLyrics(null);
          setIsLoadingLyrics(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentSong, lyricsProvider]);

  // Load stream and play song
  const playSong = useCallback(
    async (song: Song, contextQueue?: Song[], startIndex: number = 0) => {
      setError(null);
      setIsLoading(true);

      if (contextQueue && contextQueue.length > 0) {
        setQueue(contextQueue);
        setCurrentIndex(startIndex);
      } else if (!queue.some((s) => s.id === song.id)) {
        setQueue([song]);
        setCurrentIndex(0);
      }

      setCurrentSong(song);

      try {
        const stream = await provider.getStream(song, playbackQuality);
        if (!stream || !stream.url) {
          throw new Error(
            `Audio stream unavailable for "${song.title}". The provider did not return a playable URL.`
          );
        }

        setStreamInfo(stream);
        await globalAudioEngine.loadAndPlay(song, stream.url, 0);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to stream audio file';
        console.error('playSong error:', msg);
        setError(msg);
        setIsLoading(false);
        setIsPlaying(false);
      }
    },
    [queue, provider, playbackQuality]
  );

  const next = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentSong) {
      globalAudioEngine.seek(0);
      globalAudioEngine.play().catch(() => {});
      return;
    }

    let nextIdx = currentIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextSong = queue[nextIdx];
    if (nextSong) {
      setCurrentIndex(nextIdx);
      playSong(nextSong, queue, nextIdx);
    }
  }, [queue, currentIndex, repeatMode, currentSong, playSong]);

  const previous = useCallback(() => {
    if (currentTime > 3) {
      globalAudioEngine.seek(0);
      return;
    }
    if (queue.length === 0) return;

    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = repeatMode === 'all' ? queue.length - 1 : 0;
    }

    const prevSong = queue[prevIdx];
    if (prevSong) {
      setCurrentIndex(prevIdx);
      playSong(prevSong, queue, prevIdx);
    }
  }, [currentTime, queue, currentIndex, repeatMode, playSong]);

  // Hook automatic next-song on ended and MediaSession handlers
  useEffect(() => {
    globalAudioEngine.setEndedListener(() => {
      next();
    });

    globalAudioEngine.setMediaSessionAction('nexttrack', () => {
      next();
    });

    globalAudioEngine.setMediaSessionAction('previoustrack', () => {
      previous();
    });
  }, [next, previous]);

  const play = useCallback(async () => {
    if (!currentSong && queue.length > 0) {
      return playSong(queue[0], queue, 0);
    }
    try {
      await globalAudioEngine.play();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Playback request blocked or failed';
      setError(msg);
    }
  }, [currentSong, queue, playSong]);

  const pause = useCallback(() => {
    globalAudioEngine.pause();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!currentSong && queue.length > 0) {
      playSong(queue[0], queue, 0);
      return;
    }
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [currentSong, queue, isPlaying, playSong, pause, play]);

  const seek = useCallback((seconds: number) => {
    globalAudioEngine.seek(seconds);
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsMuted(false);
    globalAudioEngine.setVolume(clamped);
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, clamped.toString());
    } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    globalAudioEngine.setMute(nextMute);
  }, [isMuted]);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  const setPlaybackQuality = useCallback(
    (quality: PlaybackQuality) => {
      setPlaybackQualityState(quality);
      try {
        localStorage.setItem(STORAGE_KEY_QUALITY, quality);
      } catch {
        // Ignore
      }

      if (currentSong) {
        provider.getStream(currentSong, quality).then((s) => {
          if (s) {
            setStreamInfo(s);
          }
        });
      }
    },
    [currentSong, provider]
  );

  // Queue Operations
  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const playNext = useCallback(
    (song: Song) => {
      setQueue((prev) => {
        const nextQ = [...prev];
        nextQ.splice(currentIndex + 1, 0, song);
        return nextQ;
      });
    },
    [currentIndex]
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((prev) => prev.filter((_, i) => i !== index));
      if (index < currentIndex) {
        setCurrentIndex((prev) => prev - 1);
      }
    },
    [currentIndex]
  );

  const clearQueue = useCallback(() => {
    if (currentSong) {
      setQueue([currentSong]);
      setCurrentIndex(0);
    } else {
      setQueue([]);
      setCurrentIndex(0);
    }
  }, [currentSong]);

  const reorderQueue = useCallback(
    (fromIndex: number, toIndex: number) => {
      setQueue((prev) => {
        const copy = Array.from(prev);
        const [moved] = copy.splice(fromIndex, 1);
        copy.splice(toIndex, 0, moved);
        return copy;
      });
      if (currentIndex === fromIndex) {
        setCurrentIndex(toIndex);
      } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
        setCurrentIndex((prev) => prev - 1);
      } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentIndex]
  );

  const moveQueueItem = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= queue.length) return;
      reorderQueue(index, targetIndex);
    },
    [queue.length, reorderQueue]
  );

  const playQueueIndex = useCallback(
    (index: number) => {
      const targetSong = queue[index];
      if (targetSong) {
        setCurrentIndex(index);
        playSong(targetSong, queue, index);
      }
    },
    [queue, playSong]
  );

  const saveQueueAsPlaylist = useCallback(
    (title: string) => {
      const newPl: Playlist = {
        id: `pl-${Date.now()}`,
        title: title || 'Queued Tracks',
        description: `Saved from playback queue (${queue.length} tracks)`,
        songs: [...queue],
        createdAt: Date.now(),
      };
      setPlaylists((prev) => {
        const updated = [...prev, newPl];
        storageService.savePlaylists(updated);
        return updated;
      });
      return newPl;
    },
    [queue]
  );

  // Favorites Operations
  const toggleFavorite = useCallback((song: Song) => {
    setFavoriteSongs((prev) => {
      const exists = prev.some((s) => s.id === song.id);
      const updated = exists ? prev.filter((s) => s.id !== song.id) : [song, ...prev];

      setFavorites(updated.map((s) => s.id));
      storageService.saveFavorites(updated);

      setPlaylists((plList) => {
        const newPlList = plList.map((pl) => {
          if (pl.id === 'pl-favorites' || pl.isSystem) {
            return { ...pl, songs: updated };
          }
          return pl;
        });
        storageService.savePlaylists(newPlList);
        return newPlList;
      });

      return updated;
    });
  }, []);

  const playFavorites = useCallback(
    (shouldShuffle: boolean = false) => {
      if (favoriteSongs.length === 0) return;
      const list = shouldShuffle
        ? [...favoriteSongs].sort(() => Math.random() - 0.5)
        : [...favoriteSongs];
      playSong(list[0], list, 0);
    },
    [favoriteSongs, playSong]
  );

  // Playlist Operations
  const createPlaylist = useCallback((title: string, description: string = '') => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      description,
      songs: [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => {
      const updated = [...prev, newPl];
      storageService.savePlaylists(updated);
      return updated;
    });
    return newPl;
  }, []);

  const renamePlaylist = useCallback((playlistId: string, title: string, description?: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          title,
          description: description !== undefined ? description : pl.description,
        };
      });
      storageService.savePlaylists(updated);
      return updated;
    });
  }, []);

  const addSongToPlaylist = useCallback((playlistId: string, song: Song) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.songs.some((s) => s.id === song.id)) return pl;
        return {
          ...pl,
          songs: [...pl.songs, song],
        };
      });
      storageService.savePlaylists(updated);
      return updated;
    });
  }, []);

  const removeSongFromPlaylist = useCallback((playlistId: string, songId: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          songs: pl.songs.filter((s) => s.id !== songId),
        };
      });
      storageService.savePlaylists(updated);
      return updated;
    });
  }, []);

  const reorderSongsInPlaylist = useCallback(
    (playlistId: string, fromIndex: number, toIndex: number) => {
      setPlaylists((prev) => {
        const updated = prev.map((pl) => {
          if (pl.id !== playlistId) return pl;
          const copy = Array.from(pl.songs);
          const [moved] = copy.splice(fromIndex, 1);
          copy.splice(toIndex, 0, moved);
          return { ...pl, songs: copy };
        });
        storageService.savePlaylists(updated);
        return updated;
      });
    },
    []
  );

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists((prev) => {
      const updated = prev.filter((pl) => pl.id !== playlistId);
      storageService.savePlaylists(updated);
      return updated;
    });
  }, []);

  const playPlaylist = useCallback(
    (playlist: Playlist, shouldShuffle: boolean = false) => {
      if (playlist.songs.length === 0) return;
      const list = shouldShuffle
        ? [...playlist.songs].sort(() => Math.random() - 0.5)
        : [...playlist.songs];
      playSong(list[0], list, 0);
    },
    [playSong]
  );

  // Equalizer
  const setEqBandGain = useCallback((bandIndex: number, gainDb: number) => {
    setEqGains((prev) => {
      const next = [...prev];
      next[bandIndex] = gainDb;
      return next;
    });
    setEqPresetState('Custom');
    globalAudioEngine.setEqualizerGain(bandIndex, gainDb);
  }, []);

  const setEqPreset = useCallback((presetName: string) => {
    const preset = EQUALIZER_PRESETS[presetName];
    if (!preset) return;
    setEqPresetState(presetName);
    setEqGains([...preset]);
    globalAudioEngine.applyEqualizerPreset(presetName);
  }, []);

  // Standardized Laptop Keyboard Shortcuts (Feature 5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;
      if (isInput) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(volume - 0.05);
          break;
        case 'KeyN':
          e.preventDefault();
          next();
          break;
        case 'KeyP':
          e.preventDefault();
          previous();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyQ':
          e.preventDefault();
          setIsQueueOpen((prev) => !prev);
          break;
        case 'KeyL':
          e.preventDefault();
          setIsLyricsOpen((prev) => !prev);
          break;
        case 'KeyF':
          e.preventDefault();
          if (currentSong) {
            toggleFavorite(currentSong);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (isNowPlayingOpen) setIsNowPlayingOpen(false);
          if (isEqualizerOpen) setIsEqualizerOpen(false);
          if (isQualityModalOpen) setIsQualityModalOpen(false);
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlayPause,
    seek,
    currentTime,
    setVolume,
    volume,
    next,
    previous,
    toggleMute,
    currentSong,
    toggleFavorite,
    isNowPlayingOpen,
    isEqualizerOpen,
    isQualityModalOpen,
    isShortcutsOpen,
  ]);

  const value = useMemo(
    () => ({
      currentSong,
      queue,
      currentIndex,
      isPlaying,
      isLoading,
      currentTime,
      duration,
      volume,
      repeatMode,
      shuffle,
      playbackQuality,
      streamInfo,
      bufferedFraction,
      isMuted,
      error,
      clearError,

      favorites,
      favoriteSongs,
      isFavorite,
      playlists,
      history,
      recentlyPlayed,
      clearPlaybackHistory,

      lyrics,
      syncedLyrics,
      plainLyrics,
      isLoadingLyrics,
      lyricsProvider,

      activeView,
      setActiveView,
      selectedAlbum,
      setSelectedAlbum,
      selectedArtist,
      setSelectedArtist,
      selectedPlaylist,
      setSelectedPlaylist,

      isNowPlayingOpen,
      setIsNowPlayingOpen,
      isLyricsOpen,
      setIsLyricsOpen,
      isQueueOpen,
      setIsQueueOpen,
      isEqualizerOpen,
      setIsEqualizerOpen,
      isQualityModalOpen,
      setIsQualityModalOpen,
      isShortcutsOpen,
      setIsShortcutsOpen,

      dynamicArtworkEnabled,
      setDynamicArtworkEnabled,
      compactMode,
      setCompactMode,
      animationsEnabled,
      setAnimationsEnabled,
      crossfade,
      setCrossfade,
      gapless,
      setGapless,

      eqGains,
      eqPreset,
      setEqBandGain,
      setEqPreset,

      playSong,
      play,
      pause,
      togglePlayPause,
      previous,
      next,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      setPlaybackQuality,

      addToQueue,
      playNext,
      removeFromQueue,
      clearQueue,
      reorderQueue,
      moveQueueItem,
      playQueueIndex,
      saveQueueAsPlaylist,

      toggleFavorite,
      playFavorites,
      createPlaylist,
      renamePlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      reorderSongsInPlaylist,
      deletePlaylist,
      playPlaylist,

      provider,
    }),
    [
      currentSong,
      queue,
      currentIndex,
      isPlaying,
      isLoading,
      currentTime,
      duration,
      volume,
      repeatMode,
      shuffle,
      playbackQuality,
      streamInfo,
      bufferedFraction,
      error,
      clearError,
      favorites,
      favoriteSongs,
      isFavorite,
      playlists,
      history,
      recentlyPlayed,
      clearPlaybackHistory,
      lyrics,
      syncedLyrics,
      plainLyrics,
      isLoadingLyrics,
      lyricsProvider,
      activeView,
      selectedAlbum,
      selectedArtist,
      selectedPlaylist,
      isNowPlayingOpen,
      isLyricsOpen,
      isQueueOpen,
      isEqualizerOpen,
      isQualityModalOpen,
      isShortcutsOpen,
      dynamicArtworkEnabled,
      setDynamicArtworkEnabled,
      compactMode,
      setCompactMode,
      animationsEnabled,
      setAnimationsEnabled,
      crossfade,
      setCrossfade,
      gapless,
      setGapless,
      eqGains,
      eqPreset,
      setEqBandGain,
      setEqPreset,
      playSong,
      play,
      pause,
      togglePlayPause,
      previous,
      next,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      setPlaybackQuality,
      addToQueue,
      playNext,
      removeFromQueue,
      clearQueue,
      reorderQueue,
      moveQueueItem,
      playQueueIndex,
      saveQueueAsPlaylist,
      toggleFavorite,
      playFavorites,
      createPlaylist,
      renamePlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      reorderSongsInPlaylist,
      deletePlaylist,
      playPlaylist,
      provider,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

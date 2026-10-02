/**
 * @license
 * Mehsic Music Player Data Models
 * Inspired by BitChord (GPLv3)
 */

export interface Song {
  id: string;
  title: string;
  artist: string;
  artists: string[];
  album: string;
  albumId: string;
  duration: number; // in seconds
  artwork: string;
  explicit: boolean;
  availableQualities: string[];
  // Derived/utility properties for UI
  durationText?: string;
  releaseYear?: number;
  isFavorite?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  songs: Song[];
  // Utility properties for UI
  year?: number;
  trackCount?: number;
  description?: string;
}

export interface Artist {
  id: string;
  name: string;
  artwork: string;
  // Utility properties for UI
  genres?: string[];
  monthlyListenersText?: string;
  bio?: string;
  topSongs?: Song[];
  albums?: Album[];
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  artwork?: string;
  songs: Song[];
  createdAt: number;
  isSystem?: boolean;
}

export interface SearchResult {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

export interface StreamInfo {
  url: string;
  mimeType: string;
  codec: string;
  bitrate: number; // in kbps
  sampleRate: number; // in Hz (e.g. 44100, 48000, 96000)
  bitDepth: number; // e.g. 16 or 24 bit
  lossless: boolean;
  duration: number; // in seconds
  sourceNote?: string;
}

export type PlaybackQuality = 'auto' | 'high' | 'very_high' | 'lossless';
export type RepeatMode = 'off' | 'all' | 'one';

export interface LyricWord {
  startMs: number;
  endMs: number;
  text: string;
}

export interface LyricLine {
  timeMs: number;
  text: string;
  words?: LyricWord[];
  sungUntilMs?: number;
}

export interface HomeShelf {
  id: string;
  title: string;
  subtitle?: string;
  items: Array<{
    id: string;
    type: 'song' | 'album' | 'artist' | 'playlist';
    title: string;
    subtitle: string;
    thumbnailUrl: string;
    songData?: Song;
    albumData?: Album;
    artistData?: Artist;
    playlistData?: Playlist;
  }>;
}

export type ActiveView =
  | 'home'
  | 'search'
  | 'albums'
  | 'artists'
  | 'playlists'
  | 'library'
  | 'favorites'
  | 'queue'
  | 'settings';

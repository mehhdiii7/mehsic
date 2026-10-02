/**
 * @license
 * Mehsic Music Provider Architecture
 * Abstract contract decoupled from concrete music sources.
 */

import { Song, Album, Artist, Playlist, SearchResult, StreamInfo, LyricLine } from '../types/music';

export interface SearchOptions {
  filter?: 'all' | 'songs' | 'albums' | 'artists' | 'playlists';
  limit?: number;
}

export interface MusicProvider {
  readonly id: string;
  readonly name: string;
  readonly supportedQualities: string[];

  search(query: string, options?: SearchOptions): Promise<SearchResult>;
  getSong(id: string): Promise<Song | null>;
  getAlbum(id: string): Promise<Album | null>;
  getArtist(id: string): Promise<Artist | null>;
  getPlaylist(id: string): Promise<Playlist | null>;
  getStream(song: Song, quality?: string): Promise<StreamInfo | null>;
  getLyrics(song: Song): Promise<LyricLine[] | null>;
}

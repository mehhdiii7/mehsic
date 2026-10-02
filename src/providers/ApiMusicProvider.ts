/**
 * @license
 * Mehsic API Client Provider
 * Connects frontend directly to the backend /api routes, with graceful fallback.
 */

import { MusicProvider, SearchOptions } from './MusicProvider';
import { CompositeMusicProvider } from './CompositeMusicProvider';
import { Song, Album, Artist, Playlist, SearchResult, StreamInfo, LyricLine } from '../types/music';

export class ApiMusicProvider implements MusicProvider {
  readonly id = 'mehsic_api_provider';
  readonly name = 'Mehsic Cloud API';
  readonly supportedQualities = ['auto', 'high', 'very_high', 'lossless'];

  private localFallback = new CompositeMusicProvider();

  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    try {
      const q = encodeURIComponent(query);
      const filter = options?.filter || 'all';
      const limit = options?.limit || 25;
      const res = await fetch(`/api/search?q=${q}&filter=${filter}&limit=${limit}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to in-browser provider
    }
    return this.localFallback.search(query, options);
  }

  async getSong(id: string): Promise<Song | null> {
    try {
      const res = await fetch(`/api/song/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return this.localFallback.getSong(id);
  }

  async getAlbum(id: string): Promise<Album | null> {
    try {
      const res = await fetch(`/api/album/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return this.localFallback.getAlbum(id);
  }

  async getArtist(id: string): Promise<Artist | null> {
    try {
      const res = await fetch(`/api/artist/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return this.localFallback.getArtist(id);
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return this.localFallback.getPlaylist(id);
  }

  async getStream(song: Song, quality?: string): Promise<StreamInfo | null> {
    try {
      const q = quality || 'auto';
      const res = await fetch(`/api/stream/${encodeURIComponent(song.id)}?quality=${q}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return this.localFallback.getStream(song, quality);
  }

  async getLyrics(song: Song): Promise<LyricLine[] | null> {
    try {
      const res = await fetch(`/api/lyrics/${encodeURIComponent(song.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.lyrics && data.lyrics.length > 0) {
          return data.lyrics;
        }
      }
    } catch {
      // Fallback
    }
    return this.localFallback.getLyrics(song);
  }
}

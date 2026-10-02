/**
 * @license
 * Mehsic Composite Music Provider
 * Integrates global catalog search (Apple Music) and curated Studio Masters (Audiophile).
 */

import { MusicProvider, SearchOptions } from './MusicProvider';
import { ITunesMusicProvider } from './ITunesMusicProvider';
import { OpenAudiophileProvider } from './OpenAudiophileProvider';
import { Song, Album, Artist, Playlist, SearchResult, StreamInfo, LyricLine } from '../types/music';

export class CompositeMusicProvider implements MusicProvider {
  readonly id = 'composite_provider';
  readonly name = 'Mehsic Global & Master Audio';
  readonly supportedQualities = ['auto', 'high', 'very_high', 'lossless'];

  private itunesProvider = new ITunesMusicProvider();
  private audiophileProvider = new OpenAudiophileProvider();

  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    const [audioResults, itunesResults] = await Promise.all([
      this.audiophileProvider.search(query, options).catch(() => ({
        songs: [],
        albums: [],
        artists: [],
        playlists: [],
      })),
      this.itunesProvider.search(query, options).catch(() => ({
        songs: [],
        albums: [],
        artists: [],
        playlists: [],
      })),
    ]);

    // Merge without duplicates
    const songMap = new Map<string, Song>();
    audioResults.songs.forEach((s) => songMap.set(s.id, s));
    itunesResults.songs.forEach((s) => {
      if (!songMap.has(s.id)) songMap.set(s.id, s);
    });

    const albumMap = new Map<string, Album>();
    audioResults.albums.forEach((a) => albumMap.set(a.id, a));
    itunesResults.albums.forEach((a) => {
      if (!albumMap.has(a.id)) albumMap.set(a.id, a);
    });

    const artistMap = new Map<string, Artist>();
    audioResults.artists.forEach((art) => artistMap.set(art.id, art));
    itunesResults.artists.forEach((art) => {
      if (!artistMap.has(art.id)) artistMap.set(art.id, art);
    });

    return {
      songs: Array.from(songMap.values()),
      albums: Array.from(albumMap.values()),
      artists: Array.from(artistMap.values()),
      playlists: [],
    };
  }

  async getSong(id: string): Promise<Song | null> {
    if (id.startsWith('audio_flac_')) {
      return this.audiophileProvider.getSong(id);
    }
    return this.itunesProvider.getSong(id);
  }

  async getAlbum(id: string): Promise<Album | null> {
    if (id.startsWith('audio_alb_')) {
      return this.audiophileProvider.getAlbum(id);
    }
    return this.itunesProvider.getAlbum(id);
  }

  async getArtist(id: string): Promise<Artist | null> {
    if (id.startsWith('audio_art_')) {
      return this.audiophileProvider.getArtist(id);
    }
    return this.itunesProvider.getArtist(id);
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return null;
  }

  async getStream(song: Song, quality?: string): Promise<StreamInfo | null> {
    if (song.id.startsWith('audio_flac_')) {
      return this.audiophileProvider.getStream(song, quality);
    }
    return this.itunesProvider.getStream(song, quality);
  }

  async getLyrics(song: Song): Promise<LyricLine[] | null> {
    if (song.id.startsWith('audio_flac_')) {
      return this.audiophileProvider.getLyrics(song);
    }
    return this.itunesProvider.getLyrics(song);
  }
}

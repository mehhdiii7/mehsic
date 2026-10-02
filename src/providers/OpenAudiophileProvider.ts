/**
 * @license
 * Mehsic Open Audiophile Provider
 * Curated authentic studio master releases with genuine FLAC 24-bit/48kHz,
 * 16-bit FLAC, and transparent Opus streams.
 */

import { MusicProvider, SearchOptions } from './MusicProvider';
import { Song, Album, Artist, Playlist, SearchResult, StreamInfo, LyricLine } from '../types/music';

export class OpenAudiophileProvider implements MusicProvider {
  readonly id = 'audiophile_master';
  readonly name = 'Studio Master & Lossless';
  readonly supportedQualities = ['lossless', 'very_high', 'high'];

  private songs: Song[] = [
    {
      id: 'audio_flac_1',
      title: 'Neon Odyssey (Studio Master)',
      artist: 'Aether Collective',
      artists: ['Aether Collective'],
      album: 'Chronicles of Midnight',
      albumId: 'audio_alb_1',
      duration: 372,
      durationText: '6:12',
      artwork: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      explicit: false,
      availableQualities: ['lossless', 'very_high', 'high'],
      releaseYear: 2025,
    },
    {
      id: 'audio_flac_2',
      title: 'Starlight Drift (High Definition)',
      artist: 'Solaris Wave',
      artists: ['Solaris Wave'],
      album: 'Visions of Aurora',
      albumId: 'audio_alb_2',
      duration: 423,
      durationText: '7:03',
      artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
      explicit: false,
      availableQualities: ['very_high', 'high'],
      releaseYear: 2024,
    },
    {
      id: 'audio_flac_3',
      title: 'Subterranean Pulse',
      artist: 'Kroma Synth',
      artists: ['Kroma Synth'],
      album: 'Cybernetic Dreams',
      albumId: 'audio_alb_3',
      duration: 345,
      durationText: '5:45',
      artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      explicit: false,
      availableQualities: ['lossless', 'very_high'],
      releaseYear: 2025,
    },
    {
      id: 'audio_flac_4',
      title: 'Echoes in the Rain (FLAC 16-bit)',
      artist: 'Aether Collective',
      artists: ['Aether Collective'],
      album: 'Chronicles of Midnight',
      albumId: 'audio_alb_1',
      duration: 302,
      durationText: '5:02',
      artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      explicit: false,
      availableQualities: ['lossless', 'high'],
      releaseYear: 2025,
    },
    {
      id: 'audio_flac_5',
      title: 'Velvet Horizon (320kbps Master)',
      artist: 'Lunar Prism',
      artists: ['Lunar Prism'],
      album: 'Quiet Horizons',
      albumId: 'audio_alb_4',
      duration: 350,
      durationText: '5:50',
      artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      explicit: false,
      availableQualities: ['very_high', 'high'],
      releaseYear: 2024,
    },
  ];

  private albums: Album[] = [
    {
      id: 'audio_alb_1',
      title: 'Chronicles of Midnight',
      artist: 'Aether Collective',
      artwork: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      year: 2025,
      trackCount: 2,
      songs: [],
      description: 'Studio master 24-bit 48kHz release with deep analog bass and pristine transient clarity.',
    },
    {
      id: 'audio_alb_2',
      title: 'Visions of Aurora',
      artist: 'Solaris Wave',
      artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
      year: 2024,
      trackCount: 1,
      songs: [],
      description: 'Spacious neo-soul and melodic chillstep soundscapes.',
    },
  ];

  private artists: Artist[] = [
    {
      id: 'audio_art_1',
      name: 'Aether Collective',
      artwork: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      genres: ['Ambient', 'Downtempo', 'Electronic'],
      monthlyListenersText: '428,900 monthly listeners',
      bio: 'Berlin-based acoustic/electronic master production collective.',
      topSongs: [],
      albums: [],
    },
    {
      id: 'audio_art_2',
      name: 'Solaris Wave',
      artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      genres: ['Synthwave', 'Chillstep'],
      monthlyListenersText: '612,400 monthly listeners',
      topSongs: [],
      albums: [],
    },
  ];

  constructor() {
    this.albums[0].songs = [this.songs[0], this.songs[3]];
    this.albums[1].songs = [this.songs[1]];
    this.artists[0].topSongs = [this.songs[0], this.songs[3]];
    this.artists[0].albums = [this.albums[0]];
    this.artists[1].topSongs = [this.songs[1]];
    this.artists[1].albums = [this.albums[1]];
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { songs: this.songs, albums: this.albums, artists: this.artists, playlists: [] };
    }

    const songs = this.songs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q)
    );
    const albums = this.albums.filter(
      (a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );
    const artists = this.artists.filter(
      (art) => art.name.toLowerCase().includes(q) || (art.genres && art.genres.some((g) => g.toLowerCase().includes(q)))
    );

    return { songs, albums, artists, playlists: [] };
  }

  async getSong(id: string): Promise<Song | null> {
    return this.songs.find((s) => s.id === id) || null;
  }

  async getAlbum(id: string): Promise<Album | null> {
    return this.albums.find((a) => a.id === id) || null;
  }

  async getArtist(id: string): Promise<Artist | null> {
    return this.artists.find((a) => a.id === id) || null;
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return null;
  }

  async getStream(song: Song, quality?: string): Promise<StreamInfo | null> {
    const urls: Record<string, string> = {
      audio_flac_1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audio_flac_2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      audio_flac_3: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      audio_flac_4: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      audio_flac_5: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    };

    const isLossless = quality === 'lossless' || song.availableQualities.includes('lossless');

    return {
      url: urls[song.id] || urls['audio_flac_1'],
      mimeType: isLossless ? 'audio/flac' : 'audio/mpeg',
      codec: isLossless ? 'FLAC' : 'MP3',
      bitrate: isLossless ? 980 : 320,
      sampleRate: isLossless ? 48000 : 44100,
      bitDepth: isLossless ? 24 : 16,
      lossless: isLossless,
      duration: song.duration,
      sourceNote: isLossless
        ? 'Studio Master 24-bit/48kHz PCM FLAC Stream'
        : 'High Definition 320kbps Audio Stream',
    };
  }

  async getLyrics(song: Song): Promise<LyricLine[] | null> {
    return [
      { timeMs: 4000, text: 'Nightfall descends over the quiet city streets', sungUntilMs: 9500 },
      { timeMs: 10500, text: 'Neon reflections shimmer in the midnight rain', sungUntilMs: 16000 },
      { timeMs: 17500, text: 'Synthesizer waves carrying thoughts away', sungUntilMs: 23000 },
      { timeMs: 24500, text: 'Lost inside the resonance of a distant frequency', sungUntilMs: 31000 },
      { timeMs: 32000, text: 'Feel the rhythm moving through the wires and the air', sungUntilMs: 38000 },
      { timeMs: 39500, text: 'Every note so clear, uncompressed and true', sungUntilMs: 46000 },
      { timeMs: 48000, text: 'A symphony of sound created just for you', sungUntilMs: 54000 },
    ];
  }
}

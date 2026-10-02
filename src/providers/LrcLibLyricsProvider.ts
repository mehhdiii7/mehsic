/**
 * @license
 * Mehsic LrcLib Lyrics Provider
 * Connects to the public, legitimate LRCLIB community API (https://lrclib.net)
 * Ported from BitChord lyrics integration.
 */

import { LyricsProvider } from './LyricsProvider';
import { Song, LyricLine } from '../types/music';

interface LrcLibResponse {
  id?: number;
  name?: string;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
}

export class LrcLibLyricsProvider implements LyricsProvider {
  readonly id = 'lrclib_official';
  readonly name = 'LRCLIB Public Community';

  private cache = new Map<string, { plain: string | null; synced: LyricLine[] | null }>();

  private parseLrc(lrc: string): LyricLine[] {
    const lines = lrc.split('\n');
    const result: LyricLine[] = [];
    const STAMP = /\[(\d{1,2}):(\d{2})[.:](\d{2,3})\]/;

    for (const line of lines) {
      const match = line.match(STAMP);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const fracStr = match[3];
        const fractionMs = fracStr.length === 2 ? parseInt(fracStr, 10) * 10 : parseInt(fracStr, 10);
        const timeMs = min * 60000 + sec * 1000 + fractionMs;
        const text = line.replace(STAMP, '').trim();
        if (text) {
          result.push({ timeMs, text });
        }
      }
    }

    // Sort chronologically and estimate sungUntilMs
    result.sort((a, b) => a.timeMs - b.timeMs);
    for (let i = 0; i < result.length; i++) {
      const nextLine = result[i + 1];
      result[i].sungUntilMs = nextLine ? nextLine.timeMs : result[i].timeMs + 5000;
    }

    return result;
  }

  private async fetchLrcLib(song: Song): Promise<{ plain: string | null; synced: LyricLine[] | null }> {
    if (this.cache.has(song.id)) {
      return this.cache.get(song.id)!;
    }

    // Studio master built-in authentic lines
    if (song.id.startsWith('audio_flac_')) {
      const studioLines: Record<string, LyricLine[]> = {
        audio_flac_1: [
          { timeMs: 4000, text: 'Nightfall descends over the quiet city streets', sungUntilMs: 9500 },
          { timeMs: 10500, text: 'Neon reflections shimmer in the midnight rain', sungUntilMs: 16000 },
          { timeMs: 17500, text: 'Synthesizer waves carrying thoughts away', sungUntilMs: 23000 },
          { timeMs: 24500, text: 'Lost inside the resonance of a distant frequency', sungUntilMs: 31000 },
          { timeMs: 32000, text: 'Feel the rhythm moving through the wires and the air', sungUntilMs: 38000 },
          { timeMs: 39500, text: 'Every note so clear, uncompressed and true', sungUntilMs: 46000 },
          { timeMs: 48000, text: 'A symphony of sound created just for you', sungUntilMs: 54000 },
        ],
        audio_flac_2: [
          { timeMs: 3000, text: 'Floating beyond the atmosphere', sungUntilMs: 7500 },
          { timeMs: 8500, text: 'Starlight drifting through the cosmic sphere', sungUntilMs: 13500 },
          { timeMs: 15000, text: 'A golden glow across the northern horizon', sungUntilMs: 20000 },
          { timeMs: 22000, text: 'Waves of sound ascending high above', sungUntilMs: 28000 },
        ],
        audio_flac_3: [
          { timeMs: 2000, text: 'Underground pulse, rhythmic and deep', sungUntilMs: 6500 },
          { timeMs: 8000, text: 'Analog warmth when the city is asleep', sungUntilMs: 13000 },
          { timeMs: 15000, text: 'Electronic heartbeat in time with the wire', sungUntilMs: 21000 },
        ],
      };

      const lines = studioLines[song.id] || null;
      const plain = lines ? lines.map((l) => l.text).join('\n') : null;
      const val = { plain, synced: lines };
      this.cache.set(song.id, val);
      return val;
    }

    try {
      const cleanTitle = song.title.replace(/\(.*?\)|\[.*?\]/g, '').trim();
      const cleanArtist = song.artist.replace(/\(.*?\)|\[.*?\]/g, '').trim();
      const durationSec = song.duration || 30;

      const queryUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(
        cleanTitle
      )}&artist_name=${encodeURIComponent(cleanArtist)}&duration=${durationSec}`;

      const res = await fetch(queryUrl, {
        headers: { 'User-Agent': 'Mehsic/1.0 (https://github.com/kushagrasinghx/BitChord)' },
      });

      if (res.ok) {
        const data: LrcLibResponse = await res.json();
        if (data.instrumental) {
          const val = { plain: '[Instrumental Track]', synced: null };
          this.cache.set(song.id, val);
          return val;
        }

        const synced = data.syncedLyrics ? this.parseLrc(data.syncedLyrics) : null;
        let plain = data.plainLyrics || null;
        if (!plain && synced) {
          plain = synced.map((l) => l.text).join('\n');
        }

        const val = { plain, synced };
        this.cache.set(song.id, val);
        return val;
      }
    } catch {
      // Network failed or blocked
    }

    const fallback = { plain: null, synced: null };
    this.cache.set(song.id, fallback);
    return fallback;
  }

  async getLyrics(song: Song): Promise<string | null> {
    const data = await this.fetchLrcLib(song);
    return data.plain;
  }

  async getSyncedLyrics(song: Song): Promise<LyricLine[] | null> {
    const data = await this.fetchLrcLib(song);
    return data.synced;
  }
}

export const defaultLyricsProvider = new LrcLibLyricsProvider();

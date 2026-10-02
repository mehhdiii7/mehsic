/**
 * @license
 * Mehsic Lyrics Provider Architecture
 * Separate contract for retrieving plain and synchronized lyrics from legitimate sources.
 */

import { Song, LyricLine } from '../types/music';

export interface LyricsProvider {
  readonly id: string;
  readonly name: string;

  /**
   * Retrieves plain text lyrics for a song without timestamps.
   */
  getLyrics(song: Song): Promise<string | null>;

  /**
   * Retrieves synchronized/timestamped lyrics for a song.
   */
  getSyncedLyrics(song: Song): Promise<LyricLine[] | null>;
}

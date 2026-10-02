/**
 * @license
 * Mehsic User Data Storage Service
 * Robust IndexedDB persistence with localStorage fallback for:
 * - Favorites (full Song metadata)
 * - Playlists (user created & custom)
 * - Playback History (actual played tracks with timestamps)
 * - Search History
 */

import { Song, Playlist } from '../types/music';

export interface PlaybackHistoryItem {
  id: string;
  song: Song;
  timestamp: number;
  playbackPosition?: number;
}

const DB_NAME = 'mehsic_user_db';
const DB_VERSION = 1;
const STORE_FAVORITES = 'favorites';
const STORE_PLAYLISTS = 'playlists';
const STORE_HISTORY = 'history';
const STORE_SEARCH_HISTORY = 'search_history';

class StorageService {
  private dbPromise: Promise<IDBDatabase | null>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
            db.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
            db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_HISTORY)) {
            const histStore = db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
            histStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_SEARCH_HISTORY)) {
            db.createObjectStore(STORE_SEARCH_HISTORY, { keyPath: 'query' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('IndexedDB failed to open, using localStorage fallback');
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB exception, using localStorage fallback', err);
        resolve(null);
      }
    });
  }

  // --- FAVORITES ---
  async getFavorites(): Promise<Song[]> {
    const db = await this.dbPromise;
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_FAVORITES, 'readonly');
          const store = tx.objectStore(STORE_FAVORITES);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve(this.getFavoritesFallback());
        } catch {
          resolve(this.getFavoritesFallback());
        }
      });
    }
    return this.getFavoritesFallback();
  }

  private getFavoritesFallback(): Song[] {
    try {
      const raw = localStorage.getItem('mehsic_fav_songs');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async saveFavorites(songs: Song[]): Promise<void> {
    try {
      localStorage.setItem('mehsic_fav_songs', JSON.stringify(songs));
      localStorage.setItem('mehsic_favorites', JSON.stringify(songs.map((s) => s.id)));
    } catch {
      // Ignore
    }

    const db = await this.dbPromise;
    if (!db) return;

    try {
      const tx = db.transaction(STORE_FAVORITES, 'readwrite');
      const store = tx.objectStore(STORE_FAVORITES);
      store.clear();
      for (const song of songs) {
        store.put(song);
      }
    } catch {
      // Fallback already saved
    }
  }

  // --- PLAYLISTS ---
  async getPlaylists(): Promise<Playlist[]> {
    const db = await this.dbPromise;
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_PLAYLISTS, 'readonly');
          const store = tx.objectStore(STORE_PLAYLISTS);
          const req = store.getAll();
          req.onsuccess = () => {
            const list = req.result || [];
            if (list.length > 0) resolve(list);
            else resolve(this.getPlaylistsFallback());
          };
          req.onerror = () => resolve(this.getPlaylistsFallback());
        } catch {
          resolve(this.getPlaylistsFallback());
        }
      });
    }
    return this.getPlaylistsFallback();
  }

  private getPlaylistsFallback(): Playlist[] {
    try {
      const raw = localStorage.getItem('mehsic_playlists');
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore
    }
    return [
      {
        id: 'pl-favorites',
        title: 'Liked Songs',
        description: 'Auto-updated library favorites',
        songs: [],
        createdAt: Date.now(),
        isSystem: true,
      },
    ];
  }

  async savePlaylists(playlists: Playlist[]): Promise<void> {
    try {
      localStorage.setItem('mehsic_playlists', JSON.stringify(playlists));
    } catch {
      // Ignore
    }

    const db = await this.dbPromise;
    if (!db) return;

    try {
      const tx = db.transaction(STORE_PLAYLISTS, 'readwrite');
      const store = tx.objectStore(STORE_PLAYLISTS);
      store.clear();
      for (const pl of playlists) {
        store.put(pl);
      }
    } catch {
      // Fallback already written
    }
  }

  // --- PLAYBACK HISTORY ---
  async getHistory(): Promise<PlaybackHistoryItem[]> {
    const db = await this.dbPromise;
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_HISTORY, 'readonly');
          const store = tx.objectStore(STORE_HISTORY);
          const index = store.index('timestamp');
          const req = index.getAll();
          req.onsuccess = () => {
            const items: PlaybackHistoryItem[] = req.result || [];
            items.sort((a, b) => b.timestamp - a.timestamp);
            resolve(items);
          };
          req.onerror = () => resolve(this.getHistoryFallback());
        } catch {
          resolve(this.getHistoryFallback());
        }
      });
    }
    return this.getHistoryFallback();
  }

  private getHistoryFallback(): PlaybackHistoryItem[] {
    try {
      const raw = localStorage.getItem('mehsic_playback_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async saveHistory(items: PlaybackHistoryItem[]): Promise<void> {
    const trimmed = items.slice(0, 100);
    try {
      localStorage.setItem('mehsic_playback_history', JSON.stringify(trimmed));
    } catch {
      // Ignore
    }

    const db = await this.dbPromise;
    if (!db) return;

    try {
      const tx = db.transaction(STORE_HISTORY, 'readwrite');
      const store = tx.objectStore(STORE_HISTORY);
      store.clear();
      for (const item of trimmed) {
        store.put(item);
      }
    } catch {
      // Ignore
    }
  }

  async clearHistory(): Promise<void> {
    try {
      localStorage.removeItem('mehsic_playback_history');
    } catch {
      // Ignore
    }
    const db = await this.dbPromise;
    if (!db) return;
    try {
      const tx = db.transaction(STORE_HISTORY, 'readwrite');
      tx.objectStore(STORE_HISTORY).clear();
    } catch {
      // Ignore
    }
  }

  // --- SEARCH HISTORY ---
  getSearchHistory(): string[] {
    try {
      const raw = localStorage.getItem('mehsic_search_history');
      return raw ? JSON.parse(raw) : ['Coldplay', 'Daft Punk', 'Hans Zimmer', 'Studio Master'];
    } catch {
      return ['Coldplay', 'Daft Punk'];
    }
  }

  saveSearchHistory(queries: string[]): void {
    try {
      localStorage.setItem('mehsic_search_history', JSON.stringify(queries.slice(0, 25)));
    } catch {
      // Ignore
    }
  }

  clearSearchHistory(): void {
    try {
      localStorage.removeItem('mehsic_search_history');
    } catch {
      // Ignore
    }
  }
}

export const storageService = new StorageService();

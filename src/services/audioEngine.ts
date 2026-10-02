/**
 * @license
 * Mehsic Precision Web Audio Engine
 * Incorporates Web Audio API graph (10-band EQ, AnalyserNode, GainNode) + Media Session API.
 */

import { Song } from '../types/music';

export interface EqualizerBand {
  frequency: number;
  label: string;
  gain: number; // -12dB to +12dB
}

export const EQUALIZER_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQUALIZER_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  'Treble Boost': [0, 0, 0, 0, 0, 1, 3, 5, 6, 7],
  Electronic: [5, 4, 2, 0, -2, 1, 2, 3, 4, 5],
  Rock: [4, 3, 2, 0, -1, 1, 2, 3, 4, 4],
  Vocal: [-2, -1, 0, 2, 4, 4, 3, 2, 0, -1],
  Acoustic: [3, 2, 1, 1, 2, 2, 3, 3, 2, 2],
  Classical: [4, 3, 2, 1, 0, 0, 1, 2, 3, 4],
};

export class AudioEngine {
  private audio: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  
  private onTimeUpdateCallback: ((time: number, duration: number, bufferedFraction: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStateChangeCallback: ((isPlaying: boolean, isLoading: boolean) => void) | null = null;

  private currentSong: Song | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.85;
  private crossfadeDuration: number = 2.0; // seconds

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';

    this.setupAudioListeners();
    this.setupMediaSession();
  }

  private initWebAudio() {
    if (this.audioContext) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      
      this.audioContext = new AudioCtx();
      this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
      this.gainNode = this.audioContext.createGain();
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 64;

      // Build 10-band equalizer filter chain
      let previousNode: AudioNode = this.sourceNode;

      this.eqFilters = EQUALIZER_FREQUENCIES.map((freq, index) => {
        const filter = this.audioContext!.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQUALIZER_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;

        previousNode.connect(filter);
        previousNode = filter;
        return filter;
      });

      previousNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);

      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioContext.currentTime);
    } catch {
      // If Web Audio graph creation fails due to strict browser CORS on media elements,
      // playback falls back gracefully through native HTML5 audio.
    }
  }

  private setupAudioListeners() {
    this.audio.addEventListener('timeupdate', () => {
      const current = this.audio.currentTime;
      const duration = this.audio.duration || 0;
      let bufferedFraction = 0;
      if (this.audio.buffered.length > 0 && duration > 0) {
        bufferedFraction = Math.min(1, this.audio.buffered.end(this.audio.buffered.length - 1) / duration);
      }
      this.onTimeUpdateCallback?.(current, duration, bufferedFraction);
      this.updateMediaSessionPosition();
    });

    this.audio.addEventListener('play', () => {
      this.onStateChangeCallback?.(true, false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });

    this.audio.addEventListener('pause', () => {
      this.onStateChangeCallback?.(false, false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    });

    this.audio.addEventListener('waiting', () => {
      this.onStateChangeCallback?.(false, true);
    });

    this.audio.addEventListener('playing', () => {
      this.onStateChangeCallback?.(true, false);
    });

    this.audio.addEventListener('ended', () => {
      this.onEndedCallback?.();
    });

    this.audio.addEventListener('error', () => {
      const err = this.audio.error;
      const msg = err ? `Audio playback error: code ${err.code} (${err.message})` : 'Audio network or decoding error';
      this.onErrorCallback?.(msg);
      this.onStateChangeCallback?.(false, false);
    });
  }

  private setupMediaSession() {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.seek(this.audio.currentTime - (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.seek(this.audio.currentTime + (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (typeof details.seekTime === 'number') {
          this.seek(details.seekTime);
        }
      });
    } catch {
      // Ignore unsupported media session actions
    }
  }

  public setMediaSessionAction(action: 'previoustrack' | 'nexttrack', handler: (() => void) | null) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // Ignored
    }
  }

  private updateMediaSessionMetadata(song: Song) {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: [
          { src: song.artwork, sizes: '96x96', type: 'image/jpeg' },
          { src: song.artwork, sizes: '128x128', type: 'image/jpeg' },
          { src: song.artwork, sizes: '256x256', type: 'image/jpeg' },
          { src: song.artwork, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    } catch {
      // Ignore
    }
  }

  private updateMediaSessionPosition() {
    if (!('mediaSession' in navigator) || !this.audio.duration || isNaN(this.audio.duration)) return;
    try {
      if ('setPositionState' in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration: this.audio.duration,
          playbackRate: this.audio.playbackRate,
          position: Math.min(this.audio.currentTime, this.audio.duration),
        });
      }
    } catch {
      // Ignore
    }
  }

  public async loadAndPlay(song: Song, streamUrl: string, startTimeSeconds: number = 0): Promise<void> {
    this.initWebAudio();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume().catch(() => {});
    }

    this.currentSong = song;
    this.updateMediaSessionMetadata(song);
    this.onStateChangeCallback?.(false, true);

    if (this.audio.src !== streamUrl) {
      this.audio.src = streamUrl;
      this.audio.currentTime = startTimeSeconds;
    }

    try {
      await this.audio.play();
      this.onStateChangeCallback?.(true, false);
    } catch (e) {
      // Browser autoplay policy or load error
      this.onStateChangeCallback?.(false, false);
      throw e;
    }
  }

  public async play(): Promise<void> {
    if (!this.audio.src && this.currentSong) {
      return;
    }
    this.initWebAudio();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume().catch(() => {});
    }
    return this.audio.play();
  }

  public pause(): void {
    this.audio.pause();
  }

  public togglePlayPause(): void {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  public seek(seconds: number): void {
    const valid = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
    this.audio.currentTime = valid;
    this.updateMediaSessionPosition();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted) {
      this.audio.volume = this.volume;
      if (this.gainNode && this.audioContext) {
        this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      }
    }
  }

  public setMute(mute: boolean): void {
    this.isMuted = mute;
    const targetVol = mute ? 0 : this.volume;
    this.audio.volume = targetVol;
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(targetVol, this.audioContext.currentTime);
    }
  }

  public setEqualizerGain(bandIndex: number, gainDb: number): void {
    const filter = this.eqFilters[bandIndex];
    if (filter && this.audioContext) {
      filter.gain.setValueAtTime(gainDb, this.audioContext.currentTime);
    }
  }

  public applyEqualizerPreset(presetName: string): void {
    const gains = EQUALIZER_PRESETS[presetName];
    if (!gains) return;
    gains.forEach((g, i) => {
      this.setEqualizerGain(i, g);
    });
  }

  public getAnalyserData(): Uint8Array | null {
    if (!this.analyserNode) return null;
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  public getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  public getDuration(): number {
    return this.audio.duration || 0;
  }

  public getAudioOutputInfo(): {
    contextSampleRate: number;
    channelCount: number;
    state: string;
    hasHardwareDAC: boolean;
  } {
    return {
      contextSampleRate: this.audioContext?.sampleRate || 48000,
      channelCount: this.audioContext?.destination?.channelCount || 2,
      state: this.audioContext?.state || 'ready',
      hasHardwareDAC: false, // In standard web browsers, OS mixer handles final DAC routing
    };
  }

  public setTimeUpdateListener(cb: (time: number, duration: number, bufferedFraction: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public setEndedListener(cb: () => void) {
    this.onEndedCallback = cb;
  }

  public setErrorListener(cb: (error: string) => void) {
    this.onErrorCallback = cb;
  }

  public setStateChangeListener(cb: (isPlaying: boolean, isLoading: boolean) => void) {
    this.onStateChangeCallback = cb;
  }
}

export const globalAudioEngine = new AudioEngine();

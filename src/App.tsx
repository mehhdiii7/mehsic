/**
 * @license
 * Mehsic Application Shell
 * Desktop-first music player inspired by BitChord (GPLv3).
 */

import React from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { BottomPlayer } from './components/BottomPlayer';
import { NowPlayingView } from './components/NowPlayingView';
import { EqualizerModal } from './components/EqualizerModal';
import { AudioQualityModal } from './components/AudioQualityModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

import { HomeView } from './components/views/HomeView';
import { SearchView } from './components/views/SearchView';
import { AlbumsView } from './components/views/AlbumsView';
import { ArtistsView } from './components/views/ArtistsView';
import { PlaylistsView } from './components/views/PlaylistsView';
import { LibraryView } from './components/views/LibraryView';
import { FavoritesView } from './components/views/FavoritesView';
import { QueueView } from './components/views/QueueView';
import { SettingsView } from './components/views/SettingsView';

const MainContent: React.FC = () => {
  const { activeView } = usePlayer();

  return (
    <main className="flex-1 overflow-y-auto bg-[#090a0f] relative focus:outline-none">
      {activeView === 'home' && <HomeView />}
      {activeView === 'search' && <SearchView />}
      {activeView === 'albums' && <AlbumsView />}
      {activeView === 'artists' && <ArtistsView />}
      {activeView === 'playlists' && <PlaylistsView />}
      {activeView === 'library' && <LibraryView />}
      {activeView === 'favorites' && <FavoritesView />}
      {activeView === 'queue' && <QueueView />}
      {activeView === 'settings' && <SettingsView />}
    </main>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090a0f] text-slate-100 select-none">
        {/* Workspace: Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />
          <MainContent />
        </div>

        {/* Persistent Bottom Player Dock */}
        <BottomPlayer />

        {/* Full-Screen & Floating Modals */}
        <NowPlayingView />
        <EqualizerModal />
        <AudioQualityModal />
        <KeyboardShortcutsModal />
      </div>
    </PlayerProvider>
  );
}

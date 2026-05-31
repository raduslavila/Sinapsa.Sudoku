import { useEffect, useRef, useState } from 'react';
import type { DifficultyId } from './engine/types.ts';
import type { Digit } from './engine/types.ts';
import type { GameState } from './state/gameState.ts';
import { useGameStore } from './state/gameStore.ts';
import { useSettingsStore } from './state/settingsStore.ts';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { GameScreen } from './screens/GameScreen.tsx';
import { SettingsScreen } from './screens/SettingsScreen.tsx';
import { StatisticsScreen } from './screens/StatisticsScreen.tsx';
import { loadActiveGame, deleteActiveGame } from './storage/index.ts';
import { getDifficultyConfig } from './config/difficulties.ts';
import { App as CapApp } from '@capacitor/app';

type IdleScreen = 'home' | 'settings' | 'statistics';

export default function App() {
  const game = useGameStore((s) => s.game);
  const startGame = useGameStore((s) => s.startGame);
  const continueGame = useGameStore((s) => s.continueGame);
  const goHome = useGameStore((s) => s.goHome);
  const selectCell = useGameStore((s) => s.selectCell);
  const handleDigitInput = useGameStore((s) => s.handleDigitInput);
  const clearCell = useGameStore((s) => s.clearCell);
  const undo = useGameStore((s) => s.undo);
  const hintCell = useGameStore((s) => s.hintCell);
  const applyHint = useGameStore((s) => s.applyHint);
  const setNotesMode = useGameStore((s) => s.setNotesMode);
  const pause = useGameStore((s) => s.pause);
  const resume = useGameStore((s) => s.resume);
  const initSettings = useSettingsStore((s) => s.init);

  const [idleScreen, setIdleScreen] = useState<IdleScreen>('home');

  // Loaded from IndexedDB whenever the app is on the home screen (mount + after going home).
  const [pendingSave, setPendingSave] = useState<GameState | null>(null);

  // Refs so the back-button handler always sees the latest values without re-registering.
  const gameStatusRef = useRef(game.status);
  const idleScreenRef = useRef(idleScreen);
  const goHomeRef = useRef(goHome);
  const pauseRef = useRef(pause);

  useEffect(() => {
    gameStatusRef.current = game.status;
    idleScreenRef.current = idleScreen;
    goHomeRef.current = goHome;
    pauseRef.current = pause;
  }, [game.status, idleScreen, goHome, pause]);

  // Init settings once on mount.
  useEffect(() => {
    void initSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Android back button: navigate toward HomeScreen; exit only from HomeScreen.
  useEffect(() => {
    let handle: Awaited<ReturnType<typeof CapApp.addListener>> | null = null;

    void CapApp.addListener('backButton', () => {
      if (gameStatusRef.current !== 'idle') {
        // In GameScreen — goHome already saves state.
        goHomeRef.current();
      } else if (idleScreenRef.current !== 'home') {
        // In Settings or Statistics — go back to home.
        setIdleScreen('home');
      } else {
        // Already on HomeScreen — exit the app.
        void CapApp.exitApp();
      }
    }).then((h) => { handle = h; });

    return () => {
      void handle?.remove();
    };
  }, []);

  // Pause the active game when the app leaves the foreground, including device lock.
  useEffect(() => {
    let handle: Awaited<ReturnType<typeof CapApp.addListener>> | null = null;

    void CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive && gameStatusRef.current === 'playing') {
        pauseRef.current();
      }
    }).then((h) => { handle = h; });

    return () => {
      void handle?.remove();
    };
  }, []);

  // When game returns to idle (Home pressed), reload saved game and reset to home.
  useEffect(() => {
    if (game.status !== 'idle') return;
    loadActiveGame().then((saved) => {
      setIdleScreen('home');
      setPendingSave(saved ?? null);
    }).catch(() => {/* ignore */ });
  }, [game.status]);

  // Compute a lightweight summary to pass to HomeScreen (avoids exposing full GameState).
  const savedGameSummary = (() => {
    if (!pendingSave || !pendingSave.puzzle) return undefined;
    const { puzzle, board, elapsedMs } = pendingSave;
    const difficultyName = getDifficultyConfig(puzzle.difficultyId).name;
    const fillable = 81 - puzzle.givens.size;
    const filled = board.filter((v, i) => v !== 0 && !puzzle.givens.has(i)).length;
    const percentComplete = fillable > 0 ? Math.round((filled / fillable) * 100) : 0;
    return { difficultyName, percentComplete, elapsedMs };
  })();

  const handleContinue = () => {
    if (pendingSave) {
      continueGame(pendingSave);
      setPendingSave(null);
    }
  };

  const handleDeleteSave = () => {
    setPendingSave(null);
    void deleteActiveGame();
  };

  const handleNewGameFromCurrent = () => {
    if (game.puzzle !== null) {
      startGame(game.puzzle.difficultyId);
    }
  };

  if (game.status !== 'idle') {
    return (
      <GameScreen
        game={game}
        onSelectCell={selectCell}
        onDigitInput={(d: Digit) => handleDigitInput(d)}
        onClear={clearCell}
        onUndo={undo}
        onHintSelect={hintCell}
        onHintApply={applyHint}
        onToggleNotes={() => setNotesMode(!game.notesMode)}
        onPause={pause}
        onResume={resume}
        onHome={goHome}
        onNewGame={handleNewGameFromCurrent}
      />
    );
  }

  if (idleScreen === 'settings') {
    return <SettingsScreen onBack={() => setIdleScreen('home')} />;
  }

  if (idleScreen === 'statistics') {
    return <StatisticsScreen onBack={() => setIdleScreen('home')} />;
  }

  return (
    <HomeScreen
      onStart={(id: DifficultyId) => startGame(id)}
      savedGame={savedGameSummary}
      onContinue={handleContinue}
      onDeleteSave={handleDeleteSave}
      onStatistics={() => setIdleScreen('statistics')}
      onSettings={() => setIdleScreen('settings')}
    />
  );
}

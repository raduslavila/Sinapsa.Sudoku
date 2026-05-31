import { useEffect, useState } from 'react';
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

  // Init settings once on mount.
  useEffect(() => {
    void initSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When game returns to idle (Home pressed), reload saved game and reset to home.
  useEffect(() => {
    if (game.status !== 'idle') return;
    setIdleScreen('home');
    loadActiveGame().then((saved) => {
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

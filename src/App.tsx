import { useEffect, useState } from 'react';
import type { DifficultyId } from './engine/types.ts';
import type { Digit } from './engine/types.ts';
import type { GameState } from './state/gameState.ts';
import { useGameStore } from './state/gameStore.ts';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { GameScreen } from './screens/GameScreen.tsx';
import { loadActiveGame, deleteActiveGame } from './storage/index.ts';
import { getDifficultyConfig } from './config/difficulties.ts';

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

  // Loaded from IndexedDB whenever the app is on the home screen (mount + after going home).
  const [pendingSave, setPendingSave] = useState<GameState | null>(null);

  useEffect(() => {
    if (game.status !== 'idle') return;
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

  if (game.status === 'idle') {
    return (
      <HomeScreen
        onStart={(id: DifficultyId) => startGame(id)}
        savedGame={savedGameSummary}
        onContinue={handleContinue}
        onDeleteSave={handleDeleteSave}
      />
    );
  }

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

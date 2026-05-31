import type { DifficultyId } from './engine/types.ts';
import type { Digit } from './engine/types.ts';
import { useGameStore } from './state/gameStore.ts';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { GameScreen } from './screens/GameScreen.tsx';

export default function App() {
  const game = useGameStore((s) => s.game);
  const startGame = useGameStore((s) => s.startGame);
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

  if (game.status === 'idle') {
    return (
      <HomeScreen onStart={(id: DifficultyId) => startGame(id)} />
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

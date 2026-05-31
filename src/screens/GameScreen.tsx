import type { Digit } from '../engine/types.ts';
import type { GameState } from '../state/gameState.ts';
import { getDifficultyConfig } from '../config/difficulties.ts';
import { SudokuGrid } from '../components/SudokuGrid.tsx';
import { NumberPad } from '../components/NumberPad.tsx';
import { Timer } from '../components/Timer.tsx';
import { MistakeCounter } from '../components/MistakeCounter.tsx';

interface Props {
    game: GameState;
    onSelectCell: (index: number) => void;
    onDigitInput: (digit: Digit) => void;
    onClear: () => void;
    onUndo: () => void;
    onHintSelect: () => void;
    onHintApply: () => void;
    onToggleNotes: () => void;
    onPause: () => void;
    onResume: () => void;
    onHome: () => void;
}

const GRID_WIDTH = 'calc(var(--cell-size) * 9 + 2px)';

export function GameScreen({
    game,
    onSelectCell,
    onDigitInput,
    onClear,
    onUndo,
    onHintSelect,
    onHintApply,
    onToggleNotes,
    onPause,
    onResume,
    onHome,
}: Props) {
    if (game.puzzle === null) return null;

    const diffName = getDifficultyConfig(game.puzzle.difficultyId).name;
    const isPaused = game.status === 'paused';
    const isOver = game.status === 'over' || game.status === 'won';
    const padDisabled = isPaused || isOver;

    const hintedIndices: ReadonlySet<number> =
        game.hintedIndex !== null ? new Set([game.hintedIndex]) : new Set();

    return (
        <main
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 8px 0',
                width: '100%',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: GRID_WIDTH,
                }}
            >
                <button
                    type="button"
                    aria-label="Back to home"
                    onClick={onHome}
                    style={{
                        fontSize: 13,
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        padding: '5px 12px',
                        borderRadius: 6,
                        background: 'var(--color-selected)',
                        border: '1.5px solid var(--color-primary)',
                    }}
                >
                    Home
                </button>

                <span style={{ fontWeight: 600, fontSize: 15 }}>{diffName}</span>

                <button
                    type="button"
                    aria-label={isPaused ? 'Resume game' : 'Pause game'}
                    onClick={isPaused ? onResume : onPause}
                    disabled={isOver}
                    style={{
                        fontSize: 13,
                        color: isPaused ? 'var(--color-bg)' : 'var(--color-primary)',
                        fontWeight: 600,
                        padding: '5px 12px',
                        borderRadius: 6,
                        background: isPaused ? 'var(--color-primary)' : 'var(--color-selected)',
                        border: '1.5px solid var(--color-primary)',
                        opacity: isOver ? 0.4 : 1,
                    }}
                >
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: GRID_WIDTH,
                    padding: '4px 4px',
                }}
            >
                <MistakeCounter count={game.mistakeCount} limit={game.mistakeLimit} />
                <Timer game={game} status={game.status} />
            </div>

            {/* Grid area — fills remaining space and centers content vertically */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    minHeight: 0,
                }}
            >
                {game.status === 'won' && (
                    <div
                        role="alert"
                        style={{
                            width: '100%',
                            maxWidth: GRID_WIDTH,
                            background: '#d4f5e4',
                            border: '1.5px solid #2b7a45',
                            borderRadius: 8,
                            padding: '10px 16px',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: '#2b7a45',
                        }}
                    >
                        Puzzle solved!
                    </div>
                )}

                {game.status === 'over' && (
                    <div
                        role="alert"
                        style={{
                            width: '100%',
                            maxWidth: GRID_WIDTH,
                            background: '#fde8e8',
                            border: '1.5px solid var(--color-wrong)',
                            borderRadius: 8,
                            padding: '10px 16px',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: 'var(--color-wrong)',
                        }}
                    >
                        Game over - too many mistakes
                    </div>
                )}

                {isPaused ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: GRID_WIDTH,
                            height: GRID_WIDTH,
                            background: 'rgba(200,200,200,0.5)',
                            borderRadius: 4,
                            fontWeight: 600,
                            fontSize: 20,
                            color: '#555',
                        }}
                    >
                        Paused
                    </div>
                ) : (
                    <SudokuGrid
                        board={game.board}
                        solution={game.puzzle.solution}
                        givens={game.puzzle.givens}
                        notes={game.notes}
                        selectedIndex={game.selectedIndex}
                        hintedIndices={hintedIndices}
                        onSelectCell={onSelectCell}
                        onDigitInput={onDigitInput}
                        onClear={onClear}
                    />
                )}
            </div>

            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    paddingBottom: 8,
                }}
            >
                <NumberPad
                    onDigit={onDigitInput}
                    onClear={onClear}
                    onUndo={onUndo}
                    onHintSelect={onHintSelect}
                    onHintApply={onHintApply}
                    notesMode={game.notesMode}
                    onToggleNotes={onToggleNotes}
                    disabled={padDisabled}
                />

                <div
                    aria-hidden="true"
                    style={{
                        width: '100%',
                        maxWidth: GRID_WIDTH,
                        margin: '0 auto',
                        height: 60,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px dashed var(--color-border)',
                        borderRadius: 6,
                        color: '#aaa',
                        fontSize: 12,
                        letterSpacing: 1,
                    }}
                >
                    AD
                </div>
            </div>
        </main>
    );
}

import { useState } from 'react';
import type { Digit } from '../engine/types.ts';
import type { GameState } from '../state/gameState.ts';
import { getDifficultyConfig } from '../config/difficulties.ts';
import { SudokuGrid } from '../components/SudokuGrid.tsx';
import { NumberPad } from '../components/NumberPad.tsx';
import { Timer } from '../components/Timer.tsx';
import { MistakeCounter } from '../components/MistakeCounter.tsx';
import { getRemainingDigitCounts } from '../components/numberPadCounts.ts';

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
    onNewGame: () => void;
}

const GRID_WIDTH = 'calc(var(--cell-size) * 9 + 2px)';

function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatUsage(count: number, noun: string): string {
    if (count === 0) return `no ${noun}s`;
    if (count === 1) return `1 ${noun}`;
    return `${count} ${noun}s`;
}

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
    onNewGame,
}: Props) {
    const [dismissedCompletionSeed, setDismissedCompletionSeed] = useState<string | null>(null);

    if (game.puzzle === null) return null;
    const puzzle = game.puzzle;

    const diffName = getDifficultyConfig(puzzle.difficultyId).name;
    const isPaused = game.status === 'paused';
    const isOver = game.status === 'over' || game.status === 'won';
    const showCompletionPopup =
        game.status === 'won' && dismissedCompletionSeed !== puzzle.seed;
    const padDisabled = isPaused || isOver;
    const remainingHints =
        game.hintLimit === null ? null : Math.max(0, game.hintLimit - game.hintsUsed);
    const remainingDigitCounts = getRemainingDigitCounts(game.board, puzzle.solution);
    const isFlawless = game.status === 'won' && game.hintsUsed === 0 && game.mistakeCount === 0;
    const completionTime = formatDuration(game.elapsedMs);
    const hintSummary = formatUsage(game.hintsUsed, 'hint');
    const mistakeSummary = formatUsage(game.mistakeCount, 'mistake');

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

                <div
                    style={{
                        position: 'relative',
                        width: GRID_WIDTH,
                        height: GRID_WIDTH,
                    }}
                >
                    {isPaused ? (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
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
                            solution={puzzle.solution}
                            givens={puzzle.givens}
                            notes={game.notes}
                            selectedIndex={game.selectedIndex}
                            hintedIndices={hintedIndices}
                            onSelectCell={onSelectCell}
                            onDigitInput={onDigitInput}
                            onClear={onClear}
                        />
                    )}

                    {showCompletionPopup && (
                        <div
                            role="alertdialog"
                            aria-modal="true"
                            aria-label={isFlawless ? 'Flawless finish' : 'Puzzle complete'}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 16,
                                background: 'rgba(8, 16, 15, 0.72)',
                                borderRadius: 10,
                            }}
                        >
                            <div
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    maxWidth: 320,
                                    background: 'linear-gradient(180deg, #f0fff6 0%, #ddf5e5 100%)',
                                    border: '1.5px solid #2b7a45',
                                    borderRadius: 16,
                                    padding: '18px 20px',
                                    boxShadow: '0 14px 40px rgba(0, 0, 0, 0.28)',
                                    textAlign: 'center',
                                    color: '#204d2e',
                                }}
                            >
                                <button
                                    type="button"
                                    aria-label="Dismiss completion popup"
                                    onClick={() => setDismissedCompletionSeed(puzzle.seed)}
                                    style={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        width: 32,
                                        height: 32,
                                        borderRadius: 999,
                                        border: 'none',
                                        background: 'rgba(32, 77, 46, 0.12)',
                                        color: '#204d2e',
                                        fontSize: 20,
                                        lineHeight: 1,
                                        cursor: 'pointer',
                                    }}
                                >
                                    ×
                                </button>
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        letterSpacing: 1.6,
                                        textTransform: 'uppercase',
                                        color: '#2b7a45',
                                        marginBottom: 8,
                                    }}
                                >
                                    {isFlawless ? 'Flawless' : 'Congratulations'}
                                </div>
                                <div
                                    style={{
                                        fontSize: 24,
                                        fontWeight: 800,
                                        marginBottom: 10,
                                    }}
                                >
                                    {completionTime}
                                </div>
                                <p
                                    style={{
                                        fontSize: 14,
                                        lineHeight: 1.45,
                                    }}
                                >
                                    {isFlawless
                                        ? 'You finished without hints or mistakes.'
                                        : `You finished in ${completionTime}, using ${hintSummary}, and with ${mistakeSummary}.`}
                                </p>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 10,
                                        marginTop: 16,
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={onHome}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            borderRadius: 10,
                                            border: '1.5px solid #2b7a45',
                                            background: 'transparent',
                                            color: '#204d2e',
                                            fontSize: 14,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Home
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDismissedCompletionSeed(puzzle.seed);
                                            onNewGame();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            borderRadius: 10,
                                            border: '1.5px solid #2b7a45',
                                            background: '#2b7a45',
                                            color: '#f6fff8',
                                            fontSize: 14,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        New Game
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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
                    remainingHints={remainingHints}
                    remainingDigitCounts={remainingDigitCounts}
                />

            </div>
        </main>
    );
}

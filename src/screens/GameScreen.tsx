import { useState } from 'react';
import type { Digit } from '../engine/types.ts';
import type { GameState } from '../state/gameState.ts';
import { getDifficultyConfig } from '../config/difficulties.ts';
import { SudokuGrid } from '../components/SudokuGrid.tsx';
import { NumberPad } from '../components/NumberPad.tsx';
import { Timer } from '../components/Timer.tsx';
import { MistakeCounter } from '../components/MistakeCounter.tsx';
import { getRemainingDigitCounts } from '../components/numberPadCounts.ts';
import { maybePromptForRating } from '../state/ratingService.ts';

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
    /** Pen-and-paper mode only: validate the board and return the result. */
    onSubmitSolution?: () => 'won' | 'incorrect';
    /** Pen-and-paper mode only: give up the current game. */
    onGiveUp?: () => void;
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
    onSubmitSolution,
    onGiveUp,
}: Props) {
    const [dismissedCompletionSeed, setDismissedCompletionSeed] = useState<string | null>(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    if (game.puzzle === null) return null;
    const puzzle = game.puzzle;

    const isPenAndPaper = game.gameMode === 'pen-and-paper';
    const isPenAndPaperWon = isPenAndPaper && game.status === 'won';
    const allCellsFilled = isPenAndPaper && game.status === 'playing' && game.board.every((v) => v !== 0);

    const diffName = getDifficultyConfig(puzzle.difficultyId).name;
    const isPaused = game.status === 'paused';
    const isOver = game.status === 'over' || game.status === 'won';
    // Classic win popup only — P&P wins use screenshot mode instead.
    const showCompletionPopup =
        game.status === 'won' && !isPenAndPaper && dismissedCompletionSeed !== puzzle.seed;
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

    const sameNumberIndices: ReadonlySet<number> =
        !isPenAndPaper && game.selectedIndex !== null && game.board[game.selectedIndex] !== 0
            ? new Set(game.board.reduce<number[]>((acc, val, idx) => {
                if (val === game.board[game.selectedIndex!] && idx !== game.selectedIndex) {
                    acc.push(idx);
                }
                return acc;
            }, []))
            : new Set();

    const acknowledgeCompletion = (nextAction?: () => void): void => {
        setDismissedCompletionSeed(puzzle.seed);
        if (game.status === 'won') {
            void maybePromptForRating({
                seed: puzzle.seed,
                difficultyId: puzzle.difficultyId,
                elapsedMs: game.elapsedMs,
                mistakeCount: game.mistakeCount,
                hintsUsed: game.hintsUsed,
            });
        }
        nextAction?.();
    };

    const handleSubmitSolution = () => {
        const result = onSubmitSolution?.();
        if (result === 'incorrect') {
            setShowSubmitModal(true);
        }
    };

    const handleGiveUp = () => {
        setShowSubmitModal(false);
        onGiveUp?.();
    };

    return (
        <main
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '2dvh 1dvh 0',
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
                    onClick={isPenAndPaperWon ? () => acknowledgeCompletion(onHome) : onHome}
                    style={{
                        fontSize: '2dvh',
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        padding: '0.5dvh 1dvh',
                        borderRadius: '0.5dvh',
                        background: 'var(--color-selected)',
                        border: '0.15dvh solid var(--color-primary)',
                    }}
                >
                    Home
                </button>

                <span style={{ fontWeight: 600, fontSize: '2dvh' }}>
                    {diffName}
                    {isPenAndPaper && (
                        <span style={{ marginLeft: '1dvh', fontSize: '1.5dvh', fontWeight: 600, color: 'var(--color-given)', background: 'var(--color-btn-bg)', borderRadius: '0.5dvh', padding: '0.5dvh 1dvh', verticalAlign: 'middle' }}>
                            Pen &amp; Paper
                        </span>
                    )}
                </span>

                <button
                    type="button"
                    aria-label={isPaused ? 'Resume game' : 'Pause game'}
                    onClick={isPaused ? onResume : onPause}
                    disabled={isOver}
                    style={{
                        fontSize: '2dvh',
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        padding: '0.5dvh 1dvh',
                        borderRadius: '0.5dvh',
                        background: 'var(--color-selected)',
                        border: '0.15dvh solid var(--color-primary)',
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
                    padding: '0.5dvh 1dvh',
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
                            border: '0.15dvh solid var(--color-wrong)',
                            borderRadius: '0.5dvh',
                            padding: '1dvh 1.6dvh',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: 'var(--color-wrong)',
                        }}
                    >
                        Game over - too many mistakes
                    </div>
                )}

                {isPenAndPaperWon && (
                    <div
                        role="status"
                        style={{
                            width: '100%',
                            maxWidth: GRID_WIDTH,
                            background: '#f0fff6',
                            border: '0.15dvh solid #2b7a45',
                            borderRadius: '0.5dvh',
                            padding: '1dvh 1.6dvh',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: '#2b7a45',
                            verticalAlign: 'unset',
                        }}
                    >
                        ✓ Puzzle solved! Screenshot your board, then tap Home.
                    </div>
                )}

                <div
                    style={{
                        position: 'relative',
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
                                borderRadius: '0.5dvh',
                                fontWeight: 600,
                                fontSize: '2dvh',
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
                            sameNumberIndices={sameNumberIndices}
                            onSelectCell={isPenAndPaperWon ? () => undefined : onSelectCell}
                            onDigitInput={onDigitInput}
                            onClear={onClear}
                            isPenAndPaper={isPenAndPaper}
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
                                    onClick={() => acknowledgeCompletion()}
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
                                        fontSize: '1.2dvh',
                                        fontWeight: 800,
                                        letterSpacing: '0.16dvh',
                                        textTransform: 'uppercase',
                                        color: '#2b7a45',
                                        marginBottom: '0.8dvh',
                                    }}
                                >
                                    {isFlawless ? 'Flawless' : 'Congratulations'}
                                </div>
                                <div
                                    style={{
                                        fontSize: '2dvh',
                                        fontWeight: 800,
                                        marginBottom: '1dvh',
                                    }}
                                >
                                    {completionTime}
                                </div>
                                <p
                                    style={{
                                        fontSize: '1.4dvh',
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
                                        onClick={() => acknowledgeCompletion(onHome)}
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
                                        onClick={() => acknowledgeCompletion(onNewGame)}
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
                    isPenAndPaper={isPenAndPaper}
                    allCellsFilled={allCellsFilled}
                    onSubmitSolution={handleSubmitSolution}
                />

            </div>

            {/* Submit-failure modal (P&P mode) */}
            {showSubmitModal && (
                <div
                    role="alertdialog"
                    aria-modal="true"
                    aria-label="Incorrect solution"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(8, 16, 15, 0.72)',
                        zIndex: 100,
                        padding: 16,
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 320,
                            background: 'var(--color-bg)',
                            border: '1.5px solid var(--color-border)',
                            borderRadius: 16,
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            boxShadow: '0 14px 40px rgba(0,0,0,0.28)',
                        }}
                    >
                        <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-wrong)', margin: 0 }}>
                            Not quite right
                        </p>
                        <p style={{ fontSize: 14, color: 'var(--color-given)', margin: 0 }}>
                            Your solution has errors. Keep trying!
                            {game.mistakeCount > 0 && (
                                <span style={{ display: 'block', marginTop: 4, color: 'var(--color-wrong)' }}>
                                    {formatUsage(game.mistakeCount, 'submit')}
                                </span>
                            )}
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                            <button
                                type="button"
                                onClick={() => setShowSubmitModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    borderRadius: 10,
                                    border: '1.5px solid var(--color-primary)',
                                    background: 'var(--color-primary)',
                                    color: 'var(--color-bg)',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Continue
                            </button>
                            <button
                                type="button"
                                onClick={handleGiveUp}
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    borderRadius: 10,
                                    border: '1.5px solid var(--color-wrong)',
                                    background: 'transparent',
                                    color: 'var(--color-wrong)',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Give Up
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

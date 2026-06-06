// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import type { GameState } from '../state/gameState.ts';
import type { Puzzle } from '../engine/types.ts';
import { EASY_PUZZLE, SOLVED_GRID } from '../test/fixtures.ts';
import { GameScreen } from './GameScreen.tsx';
import { maybePromptForRating } from '../state/ratingService.ts';

vi.mock('../state/ratingService.ts', () => ({
    maybePromptForRating: vi.fn(),
}));

function makePuzzle(): Puzzle {
    return {
        seed: 'test-seed',
        difficultyId: 1,
        grid: EASY_PUZZLE,
        solution: SOLVED_GRID,
        givens: new Set<number>(
            EASY_PUZZLE.map((value, index) => (value === 0 ? -1 : index)).filter((index) => index >= 0),
        ),
    };
}

function makeWonGameState(): GameState {
    return {
        puzzle: makePuzzle(),
        board: SOLVED_GRID,
        notes: new Map(),
        selectedIndex: null,
        notesMode: false,
        mistakeCount: 0,
        mistakeLimit: null,
        status: 'won',
        undoStack: [],
        redoStack: [],
        elapsedMs: 123000,
        startedAt: null,
        pausedAt: null,
        hintedIndex: null,
        hintsUsed: 0,
        hintLimit: null,
    };
}

describe('GameScreen completion popup rating boundary', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('requests rating when win popup is dismissed', () => {
        render(
            <GameScreen
                game={makeWonGameState()}
                onSelectCell={vi.fn()}
                onDigitInput={vi.fn()}
                onClear={vi.fn()}
                onUndo={vi.fn()}
                onHintSelect={vi.fn()}
                onHintApply={vi.fn()}
                onToggleNotes={vi.fn()}
                onPause={vi.fn()}
                onResume={vi.fn()}
                onHome={vi.fn()}
                onNewGame={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Dismiss completion popup' }));

        expect(maybePromptForRating).toHaveBeenCalledTimes(1);
        expect(maybePromptForRating).toHaveBeenCalledWith({
            seed: 'test-seed',
            difficultyId: 1,
            elapsedMs: 123000,
            mistakeCount: 0,
            hintsUsed: 0,
        });
    });

    it('does not request rating during normal gameplay UI interactions', () => {
        const playingGame: GameState = {
            ...makeWonGameState(),
            status: 'playing',
            elapsedMs: 5000,
            startedAt: 1000,
        };

        render(
            <GameScreen
                game={playingGame}
                onSelectCell={vi.fn()}
                onDigitInput={vi.fn()}
                onClear={vi.fn()}
                onUndo={vi.fn()}
                onHintSelect={vi.fn()}
                onHintApply={vi.fn()}
                onToggleNotes={vi.fn()}
                onPause={vi.fn()}
                onResume={vi.fn()}
                onHome={vi.fn()}
                onNewGame={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Back to home' }));

        expect(maybePromptForRating).not.toHaveBeenCalled();
    });

    it('routes both completion actions (Home and New Game) through the same rating boundary path', () => {
        const onHome = vi.fn();
        const onNewGame = vi.fn();

        const expectedPayload = {
            seed: 'test-seed',
            difficultyId: 1,
            elapsedMs: 123000,
            mistakeCount: 0,
            hintsUsed: 0,
        };

        const { unmount } = render(
            <GameScreen
                game={makeWonGameState()}
                onSelectCell={vi.fn()}
                onDigitInput={vi.fn()}
                onClear={vi.fn()}
                onUndo={vi.fn()}
                onHintSelect={vi.fn()}
                onHintApply={vi.fn()}
                onToggleNotes={vi.fn()}
                onPause={vi.fn()}
                onResume={vi.fn()}
                onHome={onHome}
                onNewGame={onNewGame}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Home' }));
        expect(maybePromptForRating).toHaveBeenCalledTimes(1);
        expect(maybePromptForRating).toHaveBeenNthCalledWith(1, expectedPayload);
        expect(onHome).toHaveBeenCalledTimes(1);

        unmount();

        render(
            <GameScreen
                game={makeWonGameState()}
                onSelectCell={vi.fn()}
                onDigitInput={vi.fn()}
                onClear={vi.fn()}
                onUndo={vi.fn()}
                onHintSelect={vi.fn()}
                onHintApply={vi.fn()}
                onToggleNotes={vi.fn()}
                onPause={vi.fn()}
                onResume={vi.fn()}
                onHome={onHome}
                onNewGame={onNewGame}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'New Game' }));
        expect(maybePromptForRating).toHaveBeenCalledTimes(2);
        expect(maybePromptForRating).toHaveBeenNthCalledWith(2, expectedPayload);
        expect(onNewGame).toHaveBeenCalledTimes(1);
    });
});

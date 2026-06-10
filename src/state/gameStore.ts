import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Digit, DifficultyId, GameMode } from '../engine/types.ts';
import { generatePuzzle } from '../engine/generator.ts';
import { getDifficultyConfig } from '../config/difficulties.ts';
import { useSettingsStore, effectiveMistakeLimit, effectiveHintLimit } from './settingsStore.ts';
import type { GameState } from './gameState.ts';
import {
    IDLE_STATE,
    createGame,
    selectCell as selectCellAction,
    placeDigit as placeDigitAction,
    clearCell as clearCellAction,
    toggleNote as toggleNoteAction,
    setNotesMode as setNotesModeAction,
    undo as undoAction,
    redo as redoAction,
    pause as pauseAction,
    resume as resumeAction,
    hintCell as hintCellAction,
    applyHint as applyHintAction,
    getElapsedMs as getElapsedMsAction,
    submitSolution as submitSolutionAction,
} from './gameState.ts';
import {
    saveActiveGame,
    deleteActiveGame,
    saveCompletedGame,
} from '../storage/index.ts';

// ---------------------------------------------------------------------------
// Persistence helper
// ---------------------------------------------------------------------------

/** Persists `next` state after a mutation. Fire-and-forget. */
function persistAfterMove(next: GameState): void {
    if (next.status === 'won' || next.status === 'over') {
        // elapsedMs only accumulates on pause. Add the running segment before saving.
        // We can't use getElapsedMsAction here because it checks status === 'playing'.
        const frozenElapsedMs =
            next.startedAt !== null
                ? next.elapsedMs + (Date.now() - next.startedAt)
                : next.elapsedMs;
        void saveCompletedGame({ ...next, elapsedMs: frozenElapsedMs, startedAt: null });
        void deleteActiveGame();
    } else {
        void saveActiveGame(next);
    }
}

interface GameStore {
    game: GameState;
    startGame: (difficultyId: DifficultyId, gameMode?: GameMode) => void;
    /** Load a previously saved game and resume playing. */
    continueGame: (savedState: GameState) => void;
    goHome: () => void;
    selectCell: (index: number) => void;
    /** Routes to placeDigit or toggleNote depending on notesMode. */
    handleDigitInput: (digit: Digit) => void;
    clearCell: () => void;
    setNotesMode: (enabled: boolean) => void;
    undo: () => void;
    redo: () => void;
    pause: () => void;
    resume: () => void;
    hintCell: () => void;
    applyHint: () => void;
    getElapsedMs: () => number;
    /** Pen-and-paper mode only: validates the board and returns the result. */
    submitSolution: () => 'won' | 'incorrect';
    /** Pen-and-paper mode only: save as 'over', delete active game, return to idle. */
    giveUp: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
    game: IDLE_STATE,

    startGame: (difficultyId, gameMode = 'classic') => {
        const seed = nanoid();
        const config = getDifficultyConfig(difficultyId);
        const { mistakeLimitOverrides, hintLimitOverrides } = useSettingsStore.getState();
        // In pen-and-paper mode: always unlimited mistakes (no auto-game-over),
        // and no hints regardless of difficulty defaults or user overrides.
        const mistakeLimit = gameMode === 'pen-and-paper'
            ? null
            : effectiveMistakeLimit(mistakeLimitOverrides, difficultyId, config.defaultMistakeLimit);
        const hintLimit = gameMode === 'pen-and-paper'
            ? null
            : effectiveHintLimit(hintLimitOverrides, difficultyId, config.defaultHintLimit);
        const puzzle = generatePuzzle(seed, difficultyId);
        const next = createGame(puzzle, mistakeLimit, Date.now(), hintLimit, gameMode);
        set({ game: next });
        void saveActiveGame(next);
    },

    continueGame: (savedState) => {
        set({ game: savedState });
    },

    goHome: () => {
        const current = get().game;
        if (current.status === 'playing' || current.status === 'paused') {
            void saveActiveGame(current);
        }
        set({ game: IDLE_STATE });
    },

    selectCell: (index) => {
        set((s) => ({ game: selectCellAction(s.game, index) }));
    },

    handleDigitInput: (digit) => {
        set((s) => {
            const next = s.game.notesMode
                ? toggleNoteAction(s.game, digit)
                : placeDigitAction(s.game, digit, Date.now());
            persistAfterMove(next);
            return { game: next };
        });
    },

    clearCell: () => {
        set((s) => {
            const next = clearCellAction(s.game);
            if (next !== s.game) void saveActiveGame(next);
            return { game: next };
        });
    },

    setNotesMode: (enabled) => {
        set((s) => ({ game: setNotesModeAction(s.game, enabled) }));
    },

    undo: () => {
        set((s) => {
            const next = undoAction(s.game);
            if (next !== s.game) void saveActiveGame(next);
            return { game: next };
        });
    },

    redo: () => {
        set((s) => {
            const next = redoAction(s.game);
            if (next !== s.game) void saveActiveGame(next);
            return { game: next };
        });
    },

    pause: () => {
        set((s) => {
            const next = pauseAction(s.game, Date.now());
            void saveActiveGame(next);
            return { game: next };
        });
    },

    resume: () => {
        set((s) => ({ game: resumeAction(s.game, Date.now()) }));
    },

    hintCell: () => {
        set((s) => ({ game: hintCellAction(s.game) }));
    },

    applyHint: () => {
        set((s) => {
            const next = applyHintAction(s.game, Date.now());
            persistAfterMove(next);
            return { game: next };
        });
    },

    getElapsedMs: () => getElapsedMsAction(get().game, Date.now()),

    submitSolution: () => {
        let result: 'won' | 'incorrect' = 'incorrect';
        set((s) => {
            const { state: next, result: r } = submitSolutionAction(s.game, Date.now());
            result = r;
            if (r === 'won') {
                persistAfterMove(next);
            } else {
                void saveActiveGame(next);
            }
            return { game: next };
        });
        return result;
    },

    giveUp: async () => {
        const current = get().game;
        if (current.puzzle === null) return;
        const now = Date.now();
        const frozenElapsedMs =
            current.startedAt !== null
                ? current.elapsedMs + (now - current.startedAt)
                : current.elapsedMs;
        const gaveUpState: GameState = {
            ...current,
            status: 'over',
            elapsedMs: frozenElapsedMs,
            startedAt: null,
        };
        await saveCompletedGame(gaveUpState);
        await deleteActiveGame();
        set({ game: IDLE_STATE });
    },
}));

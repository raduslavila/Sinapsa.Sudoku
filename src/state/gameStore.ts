import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Digit, DifficultyId } from '../engine/types.ts';
import { generatePuzzle } from '../engine/generator.ts';
import { getDifficultyConfig } from '../config/difficulties.ts';
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
    applyHint as applyHintAction,
    getElapsedMs as getElapsedMsAction,
} from './gameState.ts';

interface GameStore {
    game: GameState;
    startGame: (difficultyId: DifficultyId) => void;
    selectCell: (index: number) => void;
    /** Routes to placeDigit or toggleNote depending on notesMode. */
    handleDigitInput: (digit: Digit) => void;
    clearCell: () => void;
    setNotesMode: (enabled: boolean) => void;
    undo: () => void;
    redo: () => void;
    pause: () => void;
    resume: () => void;
    applyHint: () => void;
    getElapsedMs: () => number;
}

export const useGameStore = create<GameStore>((set, get) => ({
    game: IDLE_STATE,

    startGame: (difficultyId) => {
        const seed = nanoid();
        const config = getDifficultyConfig(difficultyId);
        const puzzle = generatePuzzle(seed, difficultyId);
        set({ game: createGame(puzzle, config.defaultMistakeLimit, Date.now()) });
    },

    selectCell: (index) => {
        set((s) => ({ game: selectCellAction(s.game, index) }));
    },

    handleDigitInput: (digit) => {
        set((s) => ({
            game: s.game.notesMode
                ? toggleNoteAction(s.game, digit)
                : placeDigitAction(s.game, digit),
        }));
    },

    clearCell: () => {
        set((s) => ({ game: clearCellAction(s.game) }));
    },

    setNotesMode: (enabled) => {
        set((s) => ({ game: setNotesModeAction(s.game, enabled) }));
    },

    undo: () => {
        set((s) => ({ game: undoAction(s.game) }));
    },

    redo: () => {
        set((s) => ({ game: redoAction(s.game) }));
    },

    pause: () => {
        set((s) => ({ game: pauseAction(s.game, Date.now()) }));
    },

    resume: () => {
        set((s) => ({ game: resumeAction(s.game, Date.now()) }));
    },

    applyHint: () => {
        set((s) => ({ game: applyHintAction(s.game) }));
    },

    getElapsedMs: () => getElapsedMsAction(get().game, Date.now()),
}));

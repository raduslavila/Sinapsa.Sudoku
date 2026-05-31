import type { CellValue, Digit, Puzzle, SudokuGrid } from '../engine/types.ts';
import { getPeerIndices } from '../engine/grid.ts';
import { isSolved } from '../engine/validator.ts';
import { getHint } from '../engine/hints.ts';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'over';

export interface GameSnapshot {
    readonly board: readonly CellValue[];
    readonly notes: ReadonlyMap<number, ReadonlySet<Digit>>;
}

export interface GameState {
    readonly puzzle: Puzzle | null;
    readonly board: readonly CellValue[];
    readonly notes: ReadonlyMap<number, ReadonlySet<Digit>>;
    readonly selectedIndex: number | null;
    readonly notesMode: boolean;
    readonly mistakeCount: number;
    readonly mistakeLimit: number | null;
    readonly status: GameStatus;
    readonly undoStack: readonly GameSnapshot[];
    readonly redoStack: readonly GameSnapshot[];
    readonly elapsedMs: number;
    /** Wall-clock ms at which the timer last started or resumed. */
    readonly startedAt: number | null;
    /** Wall-clock ms at which the game was paused. */
    readonly pausedAt: number | null;
    /** Cell index highlighted by the Hint button (but not yet filled). null = none. */
    readonly hintedIndex: number | null;
    /** Number of hints used this game (via applyHint). */
    readonly hintsUsed: number;
    /** Max hints allowed this game. null = unlimited. */
    readonly hintLimit: number | null;
}

export const IDLE_STATE: GameState = {
    puzzle: null,
    board: [],
    notes: new Map(),
    selectedIndex: null,
    notesMode: false,
    mistakeCount: 0,
    mistakeLimit: null,
    status: 'idle',
    undoStack: [],
    redoStack: [],
    elapsedMs: 0,
    startedAt: null,
    pausedAt: null,
    hintedIndex: null,
    hintsUsed: 0,
    hintLimit: null,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function snapshotState(state: GameState): GameSnapshot {
    const notes = new Map<number, Set<Digit>>();
    for (const [k, v] of state.notes) notes.set(k, new Set(v));
    return { board: [...state.board], notes };
}

function withUndo(state: GameState): Pick<GameState, 'undoStack' | 'redoStack'> {
    return {
        undoStack: [...state.undoStack, snapshotState(state)],
        redoStack: [],
    };
}

function isGiven(state: GameState, index: number): boolean {
    return state.puzzle?.givens.has(index) ?? false;
}

function cloneNotes(notes: ReadonlyMap<number, ReadonlySet<Digit>>): Map<number, Set<Digit>> {
    const result = new Map<number, Set<Digit>>();
    for (const [k, v] of notes) result.set(k, new Set(v));
    return result;
}

function removeDigitFromPeerNotes(
    notes: Map<number, Set<Digit>>,
    cellIndex: number,
    digit: Digit,
): void {
    for (const peer of getPeerIndices(cellIndex)) {
        const peerNotes = notes.get(peer);
        if (peerNotes === undefined) continue;
        peerNotes.delete(digit);
        if (peerNotes.size === 0) notes.delete(peer);
    }
}

function isFullyCorrect(board: readonly CellValue[], solution: SudokuGrid): boolean {
    return isSolved(board) && board.every((v, i) => v === solution[i]);
}

function finalizeIfEnded(state: GameState, status: GameStatus, now: number): Pick<GameState, 'elapsedMs' | 'startedAt' | 'pausedAt'> {
    if ((status !== 'won' && status !== 'over') || state.startedAt === null) {
        return {
            elapsedMs: state.elapsedMs,
            startedAt: state.startedAt,
            pausedAt: state.pausedAt,
        };
    }

    return {
        elapsedMs: state.elapsedMs + (now - state.startedAt),
        startedAt: null,
        pausedAt: null,
    };
}

// ---------------------------------------------------------------------------
// Public actions
// ---------------------------------------------------------------------------

/** Creates a fresh game state from a generated puzzle. */
export function createGame(
    puzzle: Puzzle,
    mistakeLimit: number | null,
    now: number,
    hintLimit: number | null = null,
): GameState {
    return {
        puzzle,
        board: [...puzzle.grid],
        notes: new Map(),
        selectedIndex: null,
        notesMode: false,
        mistakeCount: 0,
        mistakeLimit,
        status: 'playing',
        undoStack: [],
        redoStack: [],
        elapsedMs: 0,
        startedAt: now,
        pausedAt: null,
        hintedIndex: null,
        hintsUsed: 0,
        hintLimit,
    };
}

/** Selects a cell by index. Allowed while playing or paused. */
export function selectCell(state: GameState, index: number): GameState {
    if (state.status !== 'playing' && state.status !== 'paused') return state;
    if (index < 0 || index > 80) return state;
    return { ...state, selectedIndex: index, hintedIndex: null };
}

/**
 * Places a digit in the selected cell.
 * - Given cells are protected.
 * - A correct placement auto-removes the digit from peer notes.
 * - A wrong placement increments mistakeCount and may trigger game over.
 */
export function placeDigit(state: GameState, digit: Digit, now: number = Date.now()): GameState {
    if (state.status !== 'playing') return state;
    if (state.selectedIndex === null) return state;
    if (state.puzzle === null) return state;
    if (isGiven(state, state.selectedIndex)) return state;
    if (state.board[state.selectedIndex] === digit) return state;

    const board = [...state.board] as CellValue[];
    board[state.selectedIndex] = digit;

    const correct = digit === state.puzzle.solution[state.selectedIndex];
    const notes = cloneNotes(state.notes);

    let mistakeCount = state.mistakeCount;
    let status: GameStatus = state.status;

    if (!correct) {
        mistakeCount++;
        if (state.mistakeLimit !== null && mistakeCount >= state.mistakeLimit) {
            status = 'over';
        }
    } else {
        notes.delete(state.selectedIndex);
        removeDigitFromPeerNotes(notes, state.selectedIndex, digit);
        if (isFullyCorrect(board, state.puzzle.solution)) {
            status = 'won';
        }
    }

    return {
        ...state,
        ...withUndo(state),
        board,
        notes,
        mistakeCount,
        status,
        ...finalizeIfEnded(state, status, now),
        hintedIndex: null,
    };
}

/** Clears the selected cell (value and notes). No-op on given cells. */
export function clearCell(state: GameState): GameState {
    if (state.status !== 'playing') return state;
    if (state.selectedIndex === null) return state;
    if (state.puzzle === null) return state;
    if (isGiven(state, state.selectedIndex)) return state;

    const hasValue = state.board[state.selectedIndex] !== 0;
    const hasNotes = (state.notes.get(state.selectedIndex)?.size ?? 0) > 0;
    if (!hasValue && !hasNotes) return state;

    const board = [...state.board] as CellValue[];
    board[state.selectedIndex] = 0;

    const notes = cloneNotes(state.notes);
    notes.delete(state.selectedIndex);

    return { ...state, ...withUndo(state), board, notes, hintedIndex: null };
}

/** Toggles a pencil-mark digit in the selected empty cell. */
export function toggleNote(state: GameState, digit: Digit): GameState {
    if (state.status !== 'playing') return state;
    if (state.selectedIndex === null) return state;
    if (state.puzzle === null) return state;
    if (isGiven(state, state.selectedIndex)) return state;
    if (state.board[state.selectedIndex] !== 0) return state;

    const notes = cloneNotes(state.notes);
    const cellNotes = new Set<Digit>(notes.get(state.selectedIndex));

    if (cellNotes.has(digit)) {
        cellNotes.delete(digit);
    } else {
        cellNotes.add(digit);
    }

    if (cellNotes.size === 0) {
        notes.delete(state.selectedIndex);
    } else {
        notes.set(state.selectedIndex, cellNotes);
    }

    return { ...state, ...withUndo(state), notes, hintedIndex: null };
}

/** Switches notes mode on or off. */
export function setNotesMode(state: GameState, enabled: boolean): GameState {
    return { ...state, notesMode: enabled };
}

/** Reverts the last move. */
export function undo(state: GameState): GameState {
    if (state.status !== 'playing') return state;
    if (state.undoStack.length === 0) return state;

    const prev = state.undoStack[state.undoStack.length - 1];
    return {
        ...state,
        board: [...prev.board],
        notes: cloneNotes(prev.notes),
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, snapshotState(state)],
    };
}

/** Reapplies the last undone move. */
export function redo(state: GameState): GameState {
    if (state.status !== 'playing') return state;
    if (state.redoStack.length === 0) return state;

    const next = state.redoStack[state.redoStack.length - 1];
    return {
        ...state,
        board: [...next.board],
        notes: cloneNotes(next.notes),
        undoStack: [...state.undoStack, snapshotState(state)],
        redoStack: state.redoStack.slice(0, -1),
    };
}

/** Pauses the timer. */
export function pause(state: GameState, now: number): GameState {
    if (state.status !== 'playing') return state;
    if (state.startedAt === null) return state;
    return {
        ...state,
        status: 'paused',
        elapsedMs: state.elapsedMs + (now - state.startedAt),
        startedAt: null,
        pausedAt: now,
    };
}

/** Resumes the timer. */
export function resume(state: GameState, now: number): GameState {
    if (state.status !== 'paused') return state;
    return {
        ...state,
        status: 'playing',
        startedAt: now,
        pausedAt: null,
    };
}

/**
 * Highlights the first empty cell as a hint without placing a digit.
 * Sets selectedIndex and hintedIndex to that cell.
 */
export function hintCell(state: GameState): GameState {
    if (state.status !== 'playing') return state;
    if (state.puzzle === null) return state;
    if (state.hintLimit !== null && state.hintsUsed >= state.hintLimit) return state;

    const hint = getHint(state.board, state.puzzle.solution);
    if (hint === null) return state;

    if (state.hintedIndex === hint.index && state.selectedIndex === hint.index) {
        return state;
    }

    return {
        ...state,
        selectedIndex: hint.index,
        hintedIndex: hint.index,
        hintsUsed: state.hintsUsed + 1,
    };
}

/**
 * Reveals the simplest available hint (first empty cell from the solution).
 * Internally selects the cell and places the correct digit.
 */
export function applyHint(state: GameState, now: number = Date.now()): GameState {
    if (state.status !== 'playing') return state;
    if (state.puzzle === null) return state;
    if (state.hintLimit !== null && state.hintsUsed >= state.hintLimit) return state;

    const hint = getHint(state.board, state.puzzle.solution);
    if (hint === null) return state;

    const next = { ...placeDigit(selectCell(state, hint.index), hint.digit, now), hintedIndex: null };
    return { ...next, hintsUsed: state.hintsUsed + 1 };
}

/** Returns total elapsed milliseconds at the given wall-clock time. */
export function getElapsedMs(state: GameState, now: number): number {
    if (state.status === 'playing' && state.startedAt !== null) {
        return state.elapsedMs + (now - state.startedAt);
    }
    return state.elapsedMs;
}

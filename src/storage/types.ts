import type { CellValue, Digit, DifficultyId } from '../engine/types.ts';

export const CURRENT_SCHEMA_VERSION = 1;

/** A serialized active game saved to IndexedDB. */
export interface PersistedGame {
    readonly id: 'active';
    readonly schemaVersion: number;
    readonly updatedAt: number;

    // Puzzle identity
    readonly seed: string;
    readonly difficultyId: DifficultyId;
    /** The puzzle's given cells as a flat 81-char string (0 = empty). */
    readonly puzzleGrid: string;
    /** The solution as a flat 81-char string. */
    readonly solutionGrid: string;
    /** Given cell indices. */
    readonly givens: readonly number[];

    // Player progress
    /** Current board as a flat 81-char string. */
    readonly board: string;
    /** Notes: array of [cellIndex, digit[]] tuples. */
    readonly notes: readonly (readonly [number, readonly Digit[]])[];

    // Game metadata
    readonly status: 'playing' | 'paused';
    readonly mistakeCount: number;
    readonly mistakeLimit: number | null;
    readonly elapsedMs: number;

    // History (shallow — only last 50 entries to cap size)
    readonly undoStack: readonly PersistedSnapshot[];
    readonly redoStack: readonly PersistedSnapshot[];
}

export interface PersistedSnapshot {
    readonly board: string;
    readonly notes: readonly (readonly [number, readonly Digit[]])[];
}

/** A completed game summary stored in IndexedDB. */
export interface PersistedCompletedGame {
    readonly id: string;
    readonly schemaVersion: number;
    readonly updatedAt: number;

    readonly seed: string;
    readonly difficultyId: DifficultyId;
    readonly status: 'won' | 'over';
    readonly mistakeCount: number;
    readonly elapsedMs: number;
}

/** Serialized board string → CellValue[]. */
export function parseBoardString(s: string): CellValue[] {
    return s.split('').map(c => Number(c) as CellValue);
}

/** CellValue[] → 81-char string. */
export function serializeBoardArray(board: readonly CellValue[]): string {
    return board.join('');
}

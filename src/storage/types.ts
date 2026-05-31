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

    // Optional — introduced after initial schema, defaults applied on load
    readonly hintsUsed?: number;
    readonly hintLimit?: number | null;
}

export interface PersistedSnapshot {
    readonly board: string;
    readonly notes: readonly (readonly [number, readonly Digit[]])[];
}

/** Settings saved to IndexedDB. */
export interface PersistedSettings {
    readonly schemaVersion: number;
    readonly updatedAt: number;
    readonly theme: 'light' | 'dark' | 'system';
    readonly palette?: string;
    /** Per-difficulty mistake limit overrides. Key is DifficultyId as string. */
    readonly mistakeLimitOverrides: Readonly<Record<string, number | null>>;
    /** Per-difficulty hint limit overrides. Key is DifficultyId as string. null = unlimited. */
    readonly hintLimitOverrides: Readonly<Record<string, number | null>>;
    /** Developer-only: highlight note digits that conflict with placed values. */
    readonly showWrongNoteConflicts?: boolean;
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

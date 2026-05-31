import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import { nanoid } from 'nanoid';
import type { CellValue, Digit } from '../engine/types.ts';
import type { GameState, GameSnapshot } from '../state/gameState.ts';
import {
    CURRENT_SCHEMA_VERSION,
    type PersistedGame,
    type PersistedCompletedGame,
    type PersistedSettings,
    type PersistedSnapshot,
    parseBoardString,
    serializeBoardArray,
} from './types.ts';
import { DB_NAME, DB_VERSION, applyMigrations, isCompatibleSchemaVersion } from './migrations.ts';
import { persistedGameSchema, persistedCompletedGameSchema, settingsSchema } from './schemas.ts';

// ---------------------------------------------------------------------------
// DB singleton
// ---------------------------------------------------------------------------

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion) {
                applyMigrations(db, oldVersion);
            },
        });
    }
    return dbPromise;
}

// ---------------------------------------------------------------------------
// Serialization helpers
// ---------------------------------------------------------------------------

const MAX_UNDO_STACK = 50;

function serializeNotes(notes: ReadonlyMap<number, ReadonlySet<Digit>>): readonly (readonly [number, readonly Digit[]])[] {
    const result: [number, Digit[]][] = [];
    for (const [idx, set] of notes) {
        result.push([idx, [...set]]);
    }
    return result;
}

function deserializeNotes(notes: readonly (readonly [number, readonly Digit[]])[]): Map<number, Set<Digit>> {
    const result = new Map<number, Set<Digit>>();
    for (const [idx, digits] of notes) {
        result.set(idx, new Set(digits));
    }
    return result;
}

function serializeSnapshot(snapshot: GameSnapshot): PersistedSnapshot {
    return {
        board: serializeBoardArray(snapshot.board as CellValue[]),
        notes: serializeNotes(snapshot.notes),
    };
}

function deserializeSnapshot(s: PersistedSnapshot): GameSnapshot {
    return {
        board: parseBoardString(s.board),
        notes: deserializeNotes(s.notes),
    };
}

function gameStateToRecord(state: GameState): PersistedGame {
    if (!state.puzzle) throw new Error('Cannot persist a game without a puzzle');
    return {
        id: 'active',
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: Date.now(),

        seed: state.puzzle.seed,
        difficultyId: state.puzzle.difficultyId,
        puzzleGrid: serializeBoardArray(state.puzzle.grid as CellValue[]),
        solutionGrid: serializeBoardArray(state.puzzle.solution as CellValue[]),
        givens: [...state.puzzle.givens],

        board: serializeBoardArray(state.board as CellValue[]),
        notes: serializeNotes(state.notes),

        status: state.status === 'paused' ? 'paused' : 'playing',
        mistakeCount: state.mistakeCount,
        mistakeLimit: state.mistakeLimit,
        // Freeze the running segment so elapsed time survives save/load cycles.
        elapsedMs:
            state.status === 'playing' && state.startedAt !== null
                ? state.elapsedMs + (Date.now() - state.startedAt)
                : state.elapsedMs,

        undoStack: state.undoStack.slice(-MAX_UNDO_STACK).map(serializeSnapshot),
        redoStack: state.redoStack.slice(-MAX_UNDO_STACK).map(serializeSnapshot),

        hintsUsed: state.hintsUsed,
        hintLimit: state.hintLimit,
    };
}

function recordToGameState(raw: unknown): GameState | null {
    const parsed = persistedGameSchema.safeParse(raw);
    if (!parsed.success) return null;
    const r = parsed.data;

    if (!isCompatibleSchemaVersion(r.schemaVersion)) return null;

    const board = parseBoardString(r.board) as CellValue[];
    const puzzleGrid = parseBoardString(r.puzzleGrid) as CellValue[];
    const solutionGrid = parseBoardString(r.solutionGrid) as CellValue[];

    const puzzle = {
        seed: r.seed,
        difficultyId: r.difficultyId,
        grid: puzzleGrid as readonly CellValue[],
        solution: solutionGrid as readonly CellValue[],
        givens: new Set(r.givens),
    };

    const undoStack: GameSnapshot[] = r.undoStack.map(deserializeSnapshot);
    const redoStack: GameSnapshot[] = r.redoStack.map(deserializeSnapshot);

    // We restore to 'playing' even if paused — safer than auto-pausing on load.
    return {
        puzzle,
        board,
        notes: deserializeNotes(r.notes),
        selectedIndex: null,
        notesMode: false,
        mistakeCount: r.mistakeCount,
        mistakeLimit: r.mistakeLimit,
        status: 'playing',
        undoStack,
        redoStack,
        elapsedMs: r.elapsedMs,
        startedAt: Date.now(),
        pausedAt: null,
        hintedIndex: null,
        hintsUsed: r.hintsUsed ?? 0,
        hintLimit: r.hintLimit ?? null,
    };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Saves the current active game. Only persists when status is 'playing' or 'paused'.
 * Silently ignores idle/won/over states.
 */
export async function saveActiveGame(state: GameState): Promise<void> {
    if (state.status !== 'playing' && state.status !== 'paused') return;
    if (!state.puzzle) return;
    try {
        const db = await getDb();
        const record = gameStateToRecord(state);
        await db.put('activeGame', record, 'active');
    } catch {
        // Silently ignore storage errors — game is still playable without persistence
    }
}

/**
 * Loads the saved active game. Returns null if none exists or data is invalid.
 */
export async function loadActiveGame(): Promise<GameState | null> {
    try {
        const db = await getDb();
        const raw = await db.get('activeGame', 'active');
        if (!raw) return null;
        return recordToGameState(raw);
    } catch {
        return null;
    }
}

/**
 * Deletes the active game save (call after win/over).
 */
export async function deleteActiveGame(): Promise<void> {
    try {
        const db = await getDb();
        await db.delete('activeGame', 'active');
    } catch {
        // Ignore
    }
}

/**
 * Saves a completed game summary (won or over).
 */
export async function saveCompletedGame(state: GameState): Promise<void> {
    if (state.status !== 'won' && state.status !== 'over') return;
    if (!state.puzzle) return;
    try {
        const db = await getDb();
        const record: PersistedCompletedGame = {
            id: nanoid(),
            schemaVersion: CURRENT_SCHEMA_VERSION,
            updatedAt: Date.now(),
            seed: state.puzzle.seed,
            difficultyId: state.puzzle.difficultyId,
            status: state.status,
            hintsUsed: state.hintsUsed,
            mistakeCount: state.mistakeCount,
            elapsedMs: state.elapsedMs,
        };
        await db.put('completedGames', record, record.id);
    } catch {
        // Ignore
    }
}

/**
 * Loads all completed game summaries, validated and sorted newest-first.
 */
export async function loadCompletedGames(): Promise<PersistedCompletedGame[]> {
    try {
        const db = await getDb();
        const all = await db.getAll('completedGames');
        const valid: PersistedCompletedGame[] = [];
        for (const raw of all) {
            const parsed = persistedCompletedGameSchema.safeParse(raw);
            if (parsed.success && isCompatibleSchemaVersion(parsed.data.schemaVersion)) {
                valid.push(parsed.data);
            }
        }
        return valid.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
        return [];
    }
}

/** Clears completed game summaries while preserving the active game and settings. */
export async function clearCompletedGames(): Promise<void> {
    try {
        const db = await getDb();
        await db.clear('completedGames');
    } catch {
        // Ignore
    }
}

/** Clears all stored data. Useful for testing or a "reset all" settings action. */
export async function clearAllData(): Promise<void> {
    try {
        const db = await getDb();
        await db.clear('activeGame');
        await db.clear('completedGames');
        await db.clear('settings');
    } catch {
        // Ignore
    }
}

/**
 * Loads persisted settings. Returns null if none saved yet.
 */
export async function loadSettings(): Promise<PersistedSettings | null> {
    try {
        const db = await getDb();
        const raw = await db.get('settings', 'global');
        if (!raw) return null;
        const parsed = settingsSchema.safeParse(raw);
        if (!parsed.success) return null;
        if (!isCompatibleSchemaVersion(parsed.data.schemaVersion)) return null;
        return parsed.data;
    } catch {
        return null;
    }
}

/**
 * Persists the current settings object.
 */
export async function saveSettings(settings: PersistedSettings): Promise<void> {
    try {
        const db = await getDb();
        await db.put('settings', settings, 'global');
    } catch {
        // Ignore
    }
}

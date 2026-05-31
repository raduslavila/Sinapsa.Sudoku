import { describe, it, expect } from 'vitest';
import { parseBoardString, serializeBoardArray, CURRENT_SCHEMA_VERSION } from './types.ts';
import { isCompatibleSchemaVersion } from './migrations.ts';
import { persistedGameSchema, persistedCompletedGameSchema, settingsSchema } from './schemas.ts';
import type { CellValue } from '../engine/types.ts';
import { SOLVED_GRID, EASY_PUZZLE } from '../test/fixtures.ts';

// ---------------------------------------------------------------------------
// Board serialization helpers
// ---------------------------------------------------------------------------

describe('serializeBoardArray / parseBoardString', () => {
    it('round-trips a solved grid', () => {
        const s = serializeBoardArray(SOLVED_GRID);
        expect(s).toHaveLength(81);
        expect(parseBoardString(s)).toEqual([...SOLVED_GRID]);
    });

    it('round-trips a puzzle grid with zeros', () => {
        const s = serializeBoardArray(EASY_PUZZLE);
        expect(s).toHaveLength(81);
        expect(parseBoardString(s)).toEqual([...EASY_PUZZLE]);
    });

    it('serializes all zeros correctly', () => {
        const empty = new Array<CellValue>(81).fill(0);
        expect(serializeBoardArray(empty)).toBe('0'.repeat(81));
    });

    it('parses all zeros correctly', () => {
        const parsed = parseBoardString('0'.repeat(81));
        expect(parsed).toHaveLength(81);
        expect(parsed.every(v => v === 0)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Schema version compatibility
// ---------------------------------------------------------------------------

describe('isCompatibleSchemaVersion', () => {
    it('accepts the current schema version', () => {
        expect(isCompatibleSchemaVersion(CURRENT_SCHEMA_VERSION)).toBe(true);
    });

    it('rejects version 0', () => {
        expect(isCompatibleSchemaVersion(0)).toBe(false);
    });

    it('rejects a future version', () => {
        expect(isCompatibleSchemaVersion(CURRENT_SCHEMA_VERSION + 1)).toBe(false);
    });

    it('rejects negative version', () => {
        expect(isCompatibleSchemaVersion(-1)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Zod schema validation — persistedGameSchema
// ---------------------------------------------------------------------------

const BOARD_STR = serializeBoardArray(EASY_PUZZLE);
const SOLUTION_STR = serializeBoardArray(SOLVED_GRID);

function makeValidPersistedGame() {
    return {
        id: 'active' as const,
        schemaVersion: 1,
        updatedAt: Date.now(),
        seed: 'test-seed-123',
        difficultyId: 3 as const,
        puzzleGrid: BOARD_STR,
        solutionGrid: SOLUTION_STR,
        givens: [0, 1, 3],
        board: BOARD_STR,
        notes: [[5, [1, 3]]] as [number, number[]][],
        status: 'playing' as const,
        mistakeCount: 0,
        mistakeLimit: null,
        elapsedMs: 12345,
        undoStack: [],
        redoStack: [],
    };
}

describe('persistedGameSchema', () => {
    it('accepts a valid record', () => {
        const result = persistedGameSchema.safeParse(makeValidPersistedGame());
        expect(result.success).toBe(true);
    });

    it('accepts status paused', () => {
        const result = persistedGameSchema.safeParse({ ...makeValidPersistedGame(), status: 'paused' });
        expect(result.success).toBe(true);
    });

    it('rejects wrong id', () => {
        const result = persistedGameSchema.safeParse({ ...makeValidPersistedGame(), id: 'wrong' });
        expect(result.success).toBe(false);
    });

    it('rejects board string of wrong length', () => {
        const result = persistedGameSchema.safeParse({ ...makeValidPersistedGame(), board: '12345' });
        expect(result.success).toBe(false);
    });

    it('rejects board string with non-digit characters', () => {
        const result = persistedGameSchema.safeParse({
            ...makeValidPersistedGame(),
            board: 'x'.repeat(81),
        });
        expect(result.success).toBe(false);
    });

    it('rejects mistakeCount below 0', () => {
        const result = persistedGameSchema.safeParse({ ...makeValidPersistedGame(), mistakeCount: -1 });
        expect(result.success).toBe(false);
    });

    it('rejects invalid difficultyId (0)', () => {
        const result = persistedGameSchema.safeParse({ ...makeValidPersistedGame(), difficultyId: 0 });
        expect(result.success).toBe(false);
    });

    it('rejects invalid difficultyId (11)', () => {
        const result = persistedGameSchema.safeParse({ ...makeValidPersistedGame(), difficultyId: 11 });
        expect(result.success).toBe(false);
    });

    it('rejects status won (active game cannot be won)', () => {
        const result = persistedGameSchema.safeParse({ ...makeValidPersistedGame(), status: 'won' });
        expect(result.success).toBe(false);
    });

    it('accepts a positive mistakeLimit', () => {
        const result = persistedGameSchema.safeParse({ ...makeValidPersistedGame(), mistakeLimit: 3 });
        expect(result.success).toBe(true);
    });

    it('accepts with undo/redo history', () => {
        const snap = { board: BOARD_STR, notes: [] };
        const result = persistedGameSchema.safeParse({
            ...makeValidPersistedGame(),
            undoStack: [snap, snap],
            redoStack: [snap],
        });
        expect(result.success).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// Zod schema validation — persistedCompletedGameSchema
// ---------------------------------------------------------------------------

describe('persistedCompletedGameSchema', () => {
    const validCompleted = {
        id: 'abc123',
        schemaVersion: 1,
        updatedAt: Date.now(),
        seed: 'some-seed',
        difficultyId: 5 as const,
        status: 'won' as const,
        hintsUsed: 3,
        mistakeCount: 2,
        elapsedMs: 60000,
    };

    it('accepts a valid won record', () => {
        expect(persistedCompletedGameSchema.safeParse(validCompleted).success).toBe(true);
    });

    it('accepts a valid over record', () => {
        expect(persistedCompletedGameSchema.safeParse({ ...validCompleted, status: 'over' }).success).toBe(true);
    });

    it('accepts legacy records without hintsUsed', () => {
        const legacyCompleted = { ...validCompleted, hintsUsed: undefined };
        delete legacyCompleted.hintsUsed;
        expect(persistedCompletedGameSchema.safeParse(legacyCompleted).success).toBe(true);
    });

    it('rejects status playing', () => {
        expect(persistedCompletedGameSchema.safeParse({ ...validCompleted, status: 'playing' }).success).toBe(false);
    });

    it('rejects empty id', () => {
        expect(persistedCompletedGameSchema.safeParse({ ...validCompleted, id: '' }).success).toBe(false);
    });

    it('rejects negative elapsedMs', () => {
        expect(persistedCompletedGameSchema.safeParse({ ...validCompleted, elapsedMs: -1 }).success).toBe(false);
    });
});

describe('settingsSchema', () => {
    const validSettings = {
        schemaVersion: 1,
        updatedAt: Date.now(),
        theme: 'system' as const,
        palette: 'electric-blue',
        mistakeLimitOverrides: {},
        hintLimitOverrides: {},
    };

    it('accepts a valid settings record without developer-only fields', () => {
        expect(settingsSchema.safeParse(validSettings).success).toBe(true);
    });

    it('accepts the optional wrong-note toggle', () => {
        expect(settingsSchema.safeParse({ ...validSettings, showWrongNoteConflicts: true }).success).toBe(true);
    });
});

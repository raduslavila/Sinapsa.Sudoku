import { z } from 'zod';

const digitSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4),
z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal(9)]);

const cellValueSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3),
z.literal(4), z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal(9)]);

const boardStringSchema = z.string().length(81).regex(/^[0-9]{81}$/);

const notesTupleSchema = z.tuple([z.number().int().min(0).max(80), z.array(digitSchema).readonly()]).readonly();

const snapshotSchema = z.object({
    board: boardStringSchema,
    notes: z.array(notesTupleSchema).readonly(),
});

const difficultyIdSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4),
z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal(9), z.literal(10)]);

export const persistedGameSchema = z.object({
    id: z.literal('active'),
    schemaVersion: z.number().int().positive(),
    updatedAt: z.number().int(),

    seed: z.string().min(1),
    difficultyId: difficultyIdSchema,
    puzzleGrid: boardStringSchema,
    solutionGrid: boardStringSchema,
    givens: z.array(z.number().int().min(0).max(80)).readonly(),

    board: boardStringSchema,
    notes: z.array(notesTupleSchema).readonly(),

    status: z.enum(['playing', 'paused']),
    mistakeCount: z.number().int().min(0),
    mistakeLimit: z.number().int().positive().nullable(),
    elapsedMs: z.number().int().min(0),

    undoStack: z.array(snapshotSchema).readonly(),
    redoStack: z.array(snapshotSchema).readonly(),
});

export const persistedCompletedGameSchema = z.object({
    id: z.string().min(1),
    schemaVersion: z.number().int().positive(),
    updatedAt: z.number().int(),

    seed: z.string().min(1),
    difficultyId: difficultyIdSchema,
    status: z.enum(['won', 'over']),
    mistakeCount: z.number().int().min(0),
    elapsedMs: z.number().int().min(0),
});

// Re-export CellValue schema for external use if needed
export { cellValueSchema };

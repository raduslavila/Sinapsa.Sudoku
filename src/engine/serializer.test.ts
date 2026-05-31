import { describe, it, expect } from 'vitest';
import { serializeGrid, deserializeGrid, isSerializedGridValid } from './serializer.ts';
import { SOLVED_GRID, EASY_PUZZLE } from '../test/fixtures.ts';

describe('serializeGrid', () => {
    it('returns a string of length 81', () => {
        expect(serializeGrid(SOLVED_GRID)).toHaveLength(81);
        expect(serializeGrid(EASY_PUZZLE)).toHaveLength(81);
    });

    it('round-trips with deserializeGrid for a solved grid', () => {
        const serialized = serializeGrid(SOLVED_GRID);
        const restored = deserializeGrid(serialized);
        expect([...restored]).toEqual([...SOLVED_GRID]);
    });

    it('round-trips with deserializeGrid for a puzzle with empty cells', () => {
        const serialized = serializeGrid(EASY_PUZZLE);
        const restored = deserializeGrid(serialized);
        expect([...restored]).toEqual([...EASY_PUZZLE]);
    });

    it('represents empty cells as 0', () => {
        const serialized = serializeGrid(EASY_PUZZLE);
        // Index 2 is empty in EASY_PUZZLE
        expect(serialized[2]).toBe('0');
    });
});

describe('deserializeGrid', () => {
    it('parses a valid 81-character string', () => {
        const result = deserializeGrid(
            '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
        );
        expect(result).toHaveLength(81);
    });

    it('throws for a string shorter than 81 characters', () => {
        expect(() => deserializeGrid('12345')).toThrow();
    });

    it('throws for a string longer than 81 characters', () => {
        expect(() => deserializeGrid('1'.repeat(82))).toThrow();
    });

    it('throws for a string with non-digit characters', () => {
        const bad = 'x' + '0'.repeat(80);
        expect(() => deserializeGrid(bad)).toThrow();
    });
});

describe('isSerializedGridValid', () => {
    it('returns true for a valid serialized grid', () => {
        expect(isSerializedGridValid(serializeGrid(SOLVED_GRID))).toBe(true);
    });

    it('returns false for incorrect length', () => {
        expect(isSerializedGridValid('12345')).toBe(false);
    });

    it('returns false for non-digit characters', () => {
        expect(isSerializedGridValid('x' + '0'.repeat(80))).toBe(false);
    });
});

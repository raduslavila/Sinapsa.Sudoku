import { describe, it, expect } from 'vitest';
import { isValidGrid, hasDuplicates, isValidSudoku, isSolved, isValidPlacement } from './validator.ts';
import { SOLVED_GRID, EASY_PUZZLE, INVALID_PUZZLE } from '../test/fixtures.ts';

describe('isValidGrid', () => {
    it('returns true for a valid 81-cell grid', () => {
        expect(isValidGrid(SOLVED_GRID)).toBe(true);
    });

    it('returns true for a puzzle with zeros', () => {
        expect(isValidGrid(EASY_PUZZLE)).toBe(true);
    });

    it('returns false for an array with wrong length', () => {
        expect(isValidGrid([1, 2, 3])).toBe(false);
    });

    it('returns false for non-array input', () => {
        expect(isValidGrid('not-a-grid')).toBe(false);
        expect(isValidGrid(null)).toBe(false);
        expect(isValidGrid(undefined)).toBe(false);
    });

    it('returns false if any cell is out of range', () => {
        const bad = [...SOLVED_GRID] as number[];
        bad[0] = 10;
        expect(isValidGrid(bad)).toBe(false);
    });
});

describe('hasDuplicates', () => {
    it('returns false for a row with all different non-zero digits', () => {
        expect(hasDuplicates([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(false);
    });

    it('returns false when zeros are present (zeros are ignored)', () => {
        expect(hasDuplicates([1, 0, 0, 2, 0, 3, 0, 0, 0])).toBe(false);
    });

    it('returns true when a non-zero digit appears twice', () => {
        expect(hasDuplicates([1, 1, 3, 4, 5, 6, 7, 8, 9])).toBe(true);
    });
});

describe('isValidSudoku', () => {
    it('returns true for a solved grid', () => {
        expect(isValidSudoku(SOLVED_GRID)).toBe(true);
    });

    it('returns true for a partially filled valid puzzle', () => {
        expect(isValidSudoku(EASY_PUZZLE)).toBe(true);
    });

    it('returns false for a grid with duplicates in a row', () => {
        expect(isValidSudoku(INVALID_PUZZLE)).toBe(false);
    });
});

describe('isSolved', () => {
    it('returns true for a completely solved grid', () => {
        expect(isSolved(SOLVED_GRID)).toBe(true);
    });

    it('returns false for a puzzle with empty cells', () => {
        expect(isSolved(EASY_PUZZLE)).toBe(false);
    });

    it('returns false for an invalid grid with no empty cells', () => {
        // Fill INVALID_PUZZLE with non-zero values but keep duplicates
        const filled = INVALID_PUZZLE.map((v) => (v === 0 ? 1 : v));
        expect(isSolved(filled)).toBe(false);
    });
});

describe('isValidPlacement', () => {
    it('returns false when the digit already exists in the same row', () => {
        // Row 0 of EASY_PUZZLE has 5 at index 0; placing 5 at index 2 (same row) should fail
        expect(isValidPlacement(EASY_PUZZLE, 2, 5)).toBe(false);
    });

    it('returns true for a valid placement', () => {
        // Index 2 in EASY_PUZZLE is empty; SOLVED_GRID has 4 there, which is valid
        expect(isValidPlacement(EASY_PUZZLE, 2, 4)).toBe(true);
    });
});

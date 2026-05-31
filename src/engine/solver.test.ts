import { describe, it, expect } from 'vitest';
import { solve, hasUniqueSolution } from './solver.ts';
import { isSolved, givensSatisfied } from './validator.ts';
import { EASY_PUZZLE, SOLVED_GRID, INVALID_PUZZLE, MULTI_SOLUTION_PUZZLE, HARD_PUZZLE } from '../test/fixtures.ts';

describe('solve', () => {
    it('solves the easy puzzle to a correct solution', () => {
        const result = solve(EASY_PUZZLE);
        expect(result).not.toBeNull();
        expect(isSolved(result!)).toBe(true);
    });

    it('solution matches known solved grid for the easy puzzle', () => {
        const result = solve(EASY_PUZZLE);
        expect(result).not.toBeNull();
        expect([...result!]).toEqual([...SOLVED_GRID]);
    });

    it('solves the hard puzzle to a valid solution', () => {
        const result = solve(HARD_PUZZLE);
        expect(result).not.toBeNull();
        expect(isSolved(result!)).toBe(true);
    }, 5000);

    it('returns null for a grid with conflicts (invalid sudoku)', () => {
        const result = solve(INVALID_PUZZLE);
        expect(result).toBeNull();
    });

    it('returns a completed grid when given an already-solved grid', () => {
        const result = solve(SOLVED_GRID);
        expect(result).not.toBeNull();
        expect(isSolved(result!)).toBe(true);
    });

    it('throws for a non-81-cell input', () => {
        expect(() => solve([])).toThrow();
        expect(() => solve([1, 2, 3])).toThrow();
    });

    it('solution respects all givens', () => {
        const result = solve(EASY_PUZZLE);
        expect(result).not.toBeNull();
        expect(givensSatisfied(EASY_PUZZLE, result!)).toBe(true);
    });
});

describe('hasUniqueSolution', () => {
    it('returns true for the easy puzzle', () => {
        expect(hasUniqueSolution(EASY_PUZZLE)).toBe(true);
    });

    it('returns true for the hard puzzle', () => {
        expect(hasUniqueSolution(HARD_PUZZLE)).toBe(true);
    }, 10000);

    it('returns false for the empty grid (multiple solutions)', () => {
        expect(hasUniqueSolution(MULTI_SOLUTION_PUZZLE)).toBe(false);
    });

    it('returns false for the invalid puzzle', () => {
        expect(hasUniqueSolution(INVALID_PUZZLE)).toBe(false);
    });

    it('throws for a non-81-cell input', () => {
        expect(() => hasUniqueSolution([])).toThrow();
    });
});

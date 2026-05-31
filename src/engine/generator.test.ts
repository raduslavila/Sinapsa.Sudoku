import { describe, it, expect } from 'vitest';
import { generatePuzzle } from './generator.ts';
import { isValidGrid, isValidSudoku, isSolved } from './validator.ts';
import { hasUniqueSolution } from './solver.ts';

describe('generatePuzzle', () => {
    it('returns a grid with exactly 81 cells', () => {
        const puzzle = generatePuzzle('seed-test-1', 1);
        expect(puzzle.grid).toHaveLength(81);
    }, 15000);

    it('returns a valid sudoku grid', () => {
        const puzzle = generatePuzzle('seed-test-1', 1);
        expect(isValidGrid(puzzle.grid)).toBe(true);
        expect(isValidSudoku(puzzle.grid)).toBe(true);
    }, 15000);

    it('returns a solution that is fully solved', () => {
        const puzzle = generatePuzzle('seed-test-1', 1);
        expect(isSolved(puzzle.solution)).toBe(true);
    }, 15000);

    it('has exactly one solution', () => {
        const puzzle = generatePuzzle('seed-test-1', 1);
        expect(hasUniqueSolution(puzzle.grid)).toBe(true);
    }, 15000);

    it('solution satisfies all givens in the puzzle', () => {
        const puzzle = generatePuzzle('seed-test-1', 1);
        for (let i = 0; i < 81; i++) {
            if (puzzle.grid[i] !== 0) {
                expect(puzzle.solution[i]).toBe(puzzle.grid[i]);
            }
        }
    }, 15000);

    it('givens set contains only non-zero indices', () => {
        const puzzle = generatePuzzle('seed-test-1', 1);
        for (const idx of puzzle.givens) {
            expect(puzzle.grid[idx]).not.toBe(0);
        }
    }, 15000);

    it('is deterministic — same seed produces same puzzle', () => {
        const a = generatePuzzle('deterministic-seed', 1);
        const b = generatePuzzle('deterministic-seed', 1);
        expect([...a.grid]).toEqual([...b.grid]);
        expect([...a.solution]).toEqual([...b.solution]);
    }, 30000);

    it('different seeds produce different puzzles', () => {
        const a = generatePuzzle('seed-alpha', 1);
        const b = generatePuzzle('seed-beta', 1);
        // With overwhelming probability, two different seeds produce different grids
        const same = a.grid.every((v, i) => v === b.grid[i]);
        expect(same).toBe(false);
    }, 30000);

    it('beginner puzzle has at least 40 givens', () => {
        const puzzle = generatePuzzle('seed-test-beginner', 1);
        const givenCount = puzzle.grid.filter((v) => v !== 0).length;
        expect(givenCount).toBeGreaterThanOrEqual(40);
    }, 15000);
});

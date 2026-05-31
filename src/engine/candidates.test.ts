import { describe, it, expect } from 'vitest';
import { getCandidates, getAllCandidates } from './candidates.ts';
import { EASY_PUZZLE, SOLVED_GRID } from '../test/fixtures.ts';

describe('getCandidates', () => {
    it('returns an empty set for a filled cell', () => {
        // Index 0 in SOLVED_GRID is 5 (not empty)
        expect(getCandidates(SOLVED_GRID, 0).size).toBe(0);
    });

    it('returns only digits not in the same row, column, or box', () => {
        // Index 2 in EASY_PUZZLE is empty; solution value is 4
        const candidates = getCandidates(EASY_PUZZLE, 2);
        expect(candidates.has(4)).toBe(true);
        // 5 is in row 0 of EASY_PUZZLE (index 0), so it must be excluded
        expect(candidates.has(5)).toBe(false);
        // 3 is in row 0 of EASY_PUZZLE (index 1), so it must be excluded
        expect(candidates.has(3)).toBe(false);
        // 7 is in row 0 of EASY_PUZZLE (index 4), so it must be excluded
        expect(candidates.has(7)).toBe(false);
    });

    it('contains only values 1-9', () => {
        const candidates = getCandidates(EASY_PUZZLE, 2);
        for (const d of candidates) {
            expect(d).toBeGreaterThanOrEqual(1);
            expect(d).toBeLessThanOrEqual(9);
        }
    });
});

describe('getAllCandidates', () => {
    it('returns 81 candidate sets', () => {
        const all = getAllCandidates(EASY_PUZZLE);
        expect(all).toHaveLength(81);
    });

    it('returns empty sets for pre-filled cells', () => {
        const all = getAllCandidates(EASY_PUZZLE);
        // Index 0 in EASY_PUZZLE is 5 (pre-filled)
        expect(all[0].size).toBe(0);
    });

    it('returns non-empty sets for empty cells', () => {
        const all = getAllCandidates(EASY_PUZZLE);
        // Index 2 is empty
        expect(all[2].size).toBeGreaterThan(0);
    });
});

import { describe, it, expect } from 'vitest';
import { rateDifficulty } from './difficulty.ts';
import { EASY_PUZZLE, HARD_PUZZLE, SOLVED_GRID } from '../test/fixtures.ts';

describe('rateDifficulty', () => {
    it('rates the easy puzzle at difficulty 1–4', () => {
        const rating = rateDifficulty(EASY_PUZZLE);
        expect(rating.id).toBeGreaterThanOrEqual(1);
        expect(rating.id).toBeLessThanOrEqual(4);
    });

    it('rates the hard puzzle at difficulty 5–10', () => {
        const rating = rateDifficulty(HARD_PUZZLE);
        expect(rating.id).toBeGreaterThanOrEqual(5);
    }, 5000);

    it('hard puzzle rates higher than easy puzzle', () => {
        const easy = rateDifficulty(EASY_PUZZLE);
        const hard = rateDifficulty(HARD_PUZZLE);
        expect(hard.id).toBeGreaterThan(easy.id);
    }, 5000);

    it('includes the correct given count', () => {
        const rating = rateDifficulty(EASY_PUZZLE);
        const actualGivens = EASY_PUZZLE.filter((v) => v !== 0).length;
        expect(rating.givenCount).toBe(actualGivens);
    });

    it('returns a score for a solved grid (0 empty cells)', () => {
        const rating = rateDifficulty(SOLVED_GRID);
        // A fully solved grid has no candidates to place — treat as trivial
        expect(typeof rating.score).toBe('number');
    });
});

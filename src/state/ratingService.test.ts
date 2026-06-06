import { describe, expect, it } from 'vitest';
import { RATING_PROMPT_WIN_THRESHOLD, shouldPrompt } from './ratingService.ts';

describe('shouldPrompt', () => {
    it('returns false below threshold', () => {
        expect(shouldPrompt(RATING_PROMPT_WIN_THRESHOLD - 1, false)).toBe(false);
    });

    it('returns true at threshold when prompt not shown yet', () => {
        expect(shouldPrompt(RATING_PROMPT_WIN_THRESHOLD, false)).toBe(true);
    });

    it('returns true above threshold when prompt not shown yet', () => {
        expect(shouldPrompt(RATING_PROMPT_WIN_THRESHOLD + 4, false)).toBe(true);
    });

    it('returns false when prompt is already shown', () => {
        expect(shouldPrompt(RATING_PROMPT_WIN_THRESHOLD + 10, true)).toBe(false);
    });

    it('clamps negative values to zero', () => {
        expect(shouldPrompt(-5, false)).toBe(false);
    });
});

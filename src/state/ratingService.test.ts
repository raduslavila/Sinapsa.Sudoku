// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import {
    PLAY_STORE_LISTING_URL,
    RATING_PROMPT_WIN_THRESHOLD,
    openPlayStoreListing,
    shouldPrompt,
} from './ratingService.ts';

vi.mock('@capacitor/browser', () => ({
    Browser: { open: vi.fn() },
}));

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

describe('openPlayStoreListing', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('opens the Play Store listing through Capacitor on native platforms', async () => {
        vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
        await openPlayStoreListing();
        expect(Browser.open).toHaveBeenCalledWith({ url: PLAY_STORE_LISTING_URL });
    });

    it('opens the listing in a new browser tab on the web', async () => {
        vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        await openPlayStoreListing();
        expect(open).toHaveBeenCalledWith(PLAY_STORE_LISTING_URL, '_blank', 'noopener,noreferrer');
    });
});

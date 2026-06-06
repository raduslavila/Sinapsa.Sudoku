import { Capacitor } from '@capacitor/core';
import { InAppReview } from '@capacitor-community/in-app-review';
import { loadCompletedGames } from '../storage/index.ts';
import type { DifficultyId } from '../engine/types.ts';
import { useSettingsStore } from './settingsStore.ts';

export const RATING_PROMPT_WIN_THRESHOLD = 3;

export interface CurrentWinSummary {
    readonly seed: string;
    readonly difficultyId: DifficultyId;
    readonly elapsedMs: number;
    readonly mistakeCount: number;
    readonly hintsUsed: number;
}

export function shouldPrompt(completedWonGames: number, ratingPromptShown: boolean): boolean {
    const winCount = Math.max(0, Math.floor(completedWonGames));
    return !ratingPromptShown && winCount >= RATING_PROMPT_WIN_THRESHOLD;
}

export async function markPrompted(): Promise<void> {
    useSettingsStore.getState().setRatingPromptShown(true);
}

export async function requestReview(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await InAppReview.requestReview();
    } catch {
        // Ignore plugin/request failures; this must never block gameplay.
    }
}

function hasCurrentWinRecord(
    currentWin: CurrentWinSummary,
    completedGames: Awaited<ReturnType<typeof loadCompletedGames>>,
): boolean {
    return completedGames.some((g) => (
        g.status === 'won'
        && g.seed === currentWin.seed
        && g.difficultyId === currentWin.difficultyId
        && g.elapsedMs === currentWin.elapsedMs
        && g.mistakeCount === currentWin.mistakeCount
        && (g.hintsUsed ?? 0) === currentWin.hintsUsed
    ));
}

export async function maybePromptForRating(currentWin: CurrentWinSummary): Promise<void> {
    const { ratingPromptShown } = useSettingsStore.getState();
    if (ratingPromptShown) return;

    const completedGames = await loadCompletedGames();
    const completedWins = completedGames.filter((g) => g.status === 'won').length;
    const winsIncludingCurrent = hasCurrentWinRecord(currentWin, completedGames)
        ? completedWins
        : completedWins + 1;

    if (!shouldPrompt(winsIncludingCurrent, ratingPromptShown)) return;

    await requestReview();
    await markPrompted();
}

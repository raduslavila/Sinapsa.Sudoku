import type { DifficultyId } from '../engine/types.ts';
import type { PersistedCompletedGame } from '../storage/types.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DifficultyStats {
    readonly played: number;
    readonly won: number;
    readonly totalHintsUsed: number;
    readonly totalMistakes: number;
    readonly bestTimeMs: number | null;
    readonly avgTimeMs: number | null;
}

export interface PenAndPaperDifficultyStats {
    readonly played: number;
    readonly won: number;
    readonly totalSubmitMistakes: number;
    readonly bestTimeMs: number | null;
    readonly avgTimeMs: number | null;
}

export interface Statistics {
    readonly totalPlayed: number;
    readonly totalWon: number;
    readonly byDifficulty: Partial<Record<DifficultyId, DifficultyStats>>;
    readonly byPenAndPaper: Partial<Record<DifficultyId, PenAndPaperDifficultyStats>>;
}

// ---------------------------------------------------------------------------
// Pure computation
// ---------------------------------------------------------------------------

/**
 * Derives statistics from an array of completed game records.
 * Pure — no side effects, safe to call in tests.
 */
export function computeStatistics(games: readonly PersistedCompletedGame[]): Statistics {
    const classicMap = new Map<DifficultyId, {
        played: number;
        won: number;
        totalHintsUsed: number;
        totalMistakes: number;
        times: number[];
    }>();

    const papMap = new Map<DifficultyId, {
        played: number;
        won: number;
        totalSubmitMistakes: number;
        times: number[];
    }>();

    for (const g of games) {
        const id = g.difficultyId;

        if (g.gameMode === 'pen-and-paper') {
            let entry = papMap.get(id);
            if (!entry) {
                entry = { played: 0, won: 0, totalSubmitMistakes: 0, times: [] };
                papMap.set(id, entry);
            }
            entry.played++;
            entry.totalSubmitMistakes += g.mistakeCount;
            if (g.status === 'won') {
                entry.won++;
                if (g.elapsedMs > 0) entry.times.push(g.elapsedMs);
            }
        } else {
            // gameMode === 'classic' or undefined (legacy) — treat as classic
            let entry = classicMap.get(id);
            if (!entry) {
                entry = { played: 0, won: 0, totalHintsUsed: 0, totalMistakes: 0, times: [] };
                classicMap.set(id, entry);
            }
            entry.played++;
            entry.totalHintsUsed += g.hintsUsed ?? 0;
            entry.totalMistakes += g.mistakeCount;
            if (g.status === 'won') {
                entry.won++;
                if (g.elapsedMs > 0) entry.times.push(g.elapsedMs);
            }
        }
    }

    const byDifficulty: Partial<Record<DifficultyId, DifficultyStats>> = {};
    for (const [id, entry] of classicMap) {
        const bestTimeMs = entry.times.length > 0 ? Math.min(...entry.times) : null;
        const avgTimeMs =
            entry.times.length > 0
                ? Math.round(entry.times.reduce((a, b) => a + b, 0) / entry.times.length)
                : null;
        byDifficulty[id] = {
            played: entry.played,
            won: entry.won,
            totalHintsUsed: entry.totalHintsUsed,
            totalMistakes: entry.totalMistakes,
            bestTimeMs,
            avgTimeMs,
        };
    }

    const byPenAndPaper: Partial<Record<DifficultyId, PenAndPaperDifficultyStats>> = {};
    for (const [id, entry] of papMap) {
        const bestTimeMs = entry.times.length > 0 ? Math.min(...entry.times) : null;
        const avgTimeMs =
            entry.times.length > 0
                ? Math.round(entry.times.reduce((a, b) => a + b, 0) / entry.times.length)
                : null;
        byPenAndPaper[id] = {
            played: entry.played,
            won: entry.won,
            totalSubmitMistakes: entry.totalSubmitMistakes,
            bestTimeMs,
            avgTimeMs,
        };
    }

    // totalPlayed / totalWon only count classic (non-P&P) records for backwards compat.
    const classicGames = games.filter((g) => g.gameMode !== 'pen-and-paper');

    return {
        totalPlayed: classicGames.length,
        totalWon: classicGames.filter((g) => g.status === 'won').length,
        byDifficulty,
        byPenAndPaper,
    };
}

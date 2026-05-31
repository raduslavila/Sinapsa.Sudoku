import type { DifficultyId } from '../engine/types.ts';
import type { PersistedCompletedGame } from '../storage/types.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DifficultyStats {
    readonly played: number;
    readonly won: number;
    readonly bestTimeMs: number | null;
    readonly avgTimeMs: number | null;
}

export interface Statistics {
    readonly totalPlayed: number;
    readonly totalWon: number;
    readonly byDifficulty: Partial<Record<DifficultyId, DifficultyStats>>;
}

// ---------------------------------------------------------------------------
// Pure computation
// ---------------------------------------------------------------------------

/**
 * Derives statistics from an array of completed game records.
 * Pure — no side effects, safe to call in tests.
 */
export function computeStatistics(games: readonly PersistedCompletedGame[]): Statistics {
    const map = new Map<DifficultyId, { played: number; won: number; times: number[] }>();

    for (const g of games) {
        const id = g.difficultyId;
        let entry = map.get(id);
        if (!entry) {
            entry = { played: 0, won: 0, times: [] };
            map.set(id, entry);
        }
        entry.played++;
        if (g.status === 'won') {
            entry.won++;
            // Exclude zero-elapsed records (legacy saves before timing fix).
            if (g.elapsedMs > 0) {
                entry.times.push(g.elapsedMs);
            }
        }
    }

    const byDifficulty: Partial<Record<DifficultyId, DifficultyStats>> = {};
    for (const [id, entry] of map) {
        const bestTimeMs = entry.times.length > 0 ? Math.min(...entry.times) : null;
        const avgTimeMs =
            entry.times.length > 0
                ? Math.round(entry.times.reduce((a, b) => a + b, 0) / entry.times.length)
                : null;
        byDifficulty[id] = {
            played: entry.played,
            won: entry.won,
            bestTimeMs,
            avgTimeMs,
        };
    }

    return {
        totalPlayed: games.length,
        totalWon: games.filter((g) => g.status === 'won').length,
        byDifficulty,
    };
}

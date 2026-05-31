import { describe, it, expect } from 'vitest';
import { computeStatistics } from './statistics.ts';
import type { PersistedCompletedGame } from '../storage/types.ts';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeGame(
    overrides: Partial<PersistedCompletedGame> = {},
): PersistedCompletedGame {
    return {
        id: 'test-id',
        schemaVersion: 1,
        updatedAt: 1000,
        seed: 'seed',
        difficultyId: 1,
        status: 'won',
        hintsUsed: 0,
        mistakeCount: 0,
        elapsedMs: 60000,
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('computeStatistics', () => {
    it('returns zero totals for empty list', () => {
        const stats = computeStatistics([]);
        expect(stats.totalPlayed).toBe(0);
        expect(stats.totalWon).toBe(0);
        expect(stats.byDifficulty).toEqual({});
    });

    it('counts a single won game', () => {
        const stats = computeStatistics([makeGame({ elapsedMs: 120000 })]);
        expect(stats.totalPlayed).toBe(1);
        expect(stats.totalWon).toBe(1);
        expect(stats.byDifficulty[1]?.played).toBe(1);
        expect(stats.byDifficulty[1]?.won).toBe(1);
        expect(stats.byDifficulty[1]?.totalHintsUsed).toBe(0);
        expect(stats.byDifficulty[1]?.totalMistakes).toBe(0);
        expect(stats.byDifficulty[1]?.bestTimeMs).toBe(120000);
        expect(stats.byDifficulty[1]?.avgTimeMs).toBe(120000);
    });

    it('counts a single lost game', () => {
        const stats = computeStatistics([makeGame({ status: 'over', elapsedMs: 30000 })]);
        expect(stats.totalPlayed).toBe(1);
        expect(stats.totalWon).toBe(0);
        expect(stats.byDifficulty[1]?.played).toBe(1);
        expect(stats.byDifficulty[1]?.won).toBe(0);
        expect(stats.byDifficulty[1]?.totalHintsUsed).toBe(0);
        expect(stats.byDifficulty[1]?.totalMistakes).toBe(0);
        // No winning time recorded
        expect(stats.byDifficulty[1]?.bestTimeMs).toBeNull();
        expect(stats.byDifficulty[1]?.avgTimeMs).toBeNull();
    });

    it('computes best time from multiple wins', () => {
        const games = [
            makeGame({ id: 'a', elapsedMs: 90000 }),
            makeGame({ id: 'b', elapsedMs: 60000 }),
            makeGame({ id: 'c', elapsedMs: 120000 }),
        ];
        const stats = computeStatistics(games);
        expect(stats.byDifficulty[1]?.bestTimeMs).toBe(60000);
    });

    it('computes average time across wins', () => {
        const games = [
            makeGame({ id: 'a', elapsedMs: 60000 }),
            makeGame({ id: 'b', elapsedMs: 90000 }),
        ];
        const stats = computeStatistics(games);
        expect(stats.byDifficulty[1]?.avgTimeMs).toBe(75000);
    });

    it('separates stats by difficulty', () => {
        const games = [
            makeGame({ id: 'a', difficultyId: 1, status: 'won', elapsedMs: 60000, hintsUsed: 1, mistakeCount: 2 }),
            makeGame({ id: 'b', difficultyId: 3, status: 'over', elapsedMs: 0, hintsUsed: 4, mistakeCount: 3 }),
            makeGame({ id: 'c', difficultyId: 3, status: 'won', elapsedMs: 45000, hintsUsed: 2, mistakeCount: 1 }),
        ];
        const stats = computeStatistics(games);
        expect(stats.totalPlayed).toBe(3);
        expect(stats.totalWon).toBe(2);
        expect(stats.byDifficulty[1]?.played).toBe(1);
        expect(stats.byDifficulty[3]?.played).toBe(2);
        expect(stats.byDifficulty[3]?.won).toBe(1);
        expect(stats.byDifficulty[1]?.totalHintsUsed).toBe(1);
        expect(stats.byDifficulty[1]?.totalMistakes).toBe(2);
        expect(stats.byDifficulty[3]?.totalHintsUsed).toBe(6);
        expect(stats.byDifficulty[3]?.totalMistakes).toBe(4);
        expect(stats.byDifficulty[3]?.bestTimeMs).toBe(45000);
    });

    it('ignores lost games when computing times', () => {
        const games = [
            makeGame({ id: 'a', status: 'over', elapsedMs: 10000 }),
            makeGame({ id: 'b', status: 'over', elapsedMs: 20000 }),
        ];
        const stats = computeStatistics(games);
        expect(stats.byDifficulty[1]?.bestTimeMs).toBeNull();
        expect(stats.byDifficulty[1]?.avgTimeMs).toBeNull();
    });

    it('handles mix of difficulties and statuses', () => {
        const games = [
            makeGame({ id: '1', difficultyId: 1, status: 'won', elapsedMs: 100000, hintsUsed: 3, mistakeCount: 1 }),
            makeGame({ id: '2', difficultyId: 1, status: 'over', elapsedMs: 50000, hintsUsed: 1, mistakeCount: 2 }),
            makeGame({ id: '3', difficultyId: 5, status: 'won', elapsedMs: 200000, hintsUsed: 5, mistakeCount: 0 }),
        ];
        const stats = computeStatistics(games);
        expect(stats.totalPlayed).toBe(3);
        expect(stats.totalWon).toBe(2);
        expect(Object.keys(stats.byDifficulty)).toHaveLength(2);
        expect(stats.byDifficulty[1]?.played).toBe(2);
        expect(stats.byDifficulty[1]?.won).toBe(1);
        expect(stats.byDifficulty[1]?.totalHintsUsed).toBe(4);
        expect(stats.byDifficulty[1]?.totalMistakes).toBe(3);
        expect(stats.byDifficulty[5]?.played).toBe(1);
        expect(stats.byDifficulty[5]?.totalHintsUsed).toBe(5);
        expect(stats.byDifficulty[5]?.totalMistakes).toBe(0);
    });

    it('treats missing hint counts from legacy records as zero', () => {
        const stats = computeStatistics([
            makeGame({ id: 'legacy-a', difficultyId: 2, hintsUsed: undefined, mistakeCount: 4 }),
            makeGame({ id: 'legacy-b', difficultyId: 2, hintsUsed: 2, mistakeCount: 1 }),
        ]);

        expect(stats.byDifficulty[2]?.totalHintsUsed).toBe(2);
        expect(stats.byDifficulty[2]?.totalMistakes).toBe(5);
    });
});

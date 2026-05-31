import { describe, expect, it } from 'vitest';
import type { CellValue } from '../engine/types.ts';
import { SOLVED_GRID } from '../test/fixtures.ts';
import { getCompletionWaveDelays, UNIT_COMPLETION_WAVE_STEP_MS } from './unitCompletion.ts';

function createBoardWithValues(values: readonly (readonly [number, CellValue])[]): readonly CellValue[] {
    const board = Array<CellValue>(81).fill(0);
    for (const [index, value] of values) {
        board[index] = value;
    }
    return board;
}

describe('getCompletionWaveDelays', () => {
    it('returns row wave delays when a row becomes complete', () => {
        const previousBoard = createBoardWithValues([
            [0, 5], [1, 3], [2, 4], [3, 6], [4, 7], [5, 8], [6, 9], [7, 1],
        ]);
        const nextBoard = createBoardWithValues([
            [0, 5], [1, 3], [2, 4], [3, 6], [4, 7], [5, 8], [6, 9], [7, 1], [8, 2],
        ]);

        const delays = getCompletionWaveDelays(previousBoard, nextBoard, 8);

        expect(delays).not.toBeNull();
        expect(delays?.size).toBe(9);
        expect(delays?.get(8)).toBe(0);
        expect(delays?.get(7)).toBe(UNIT_COMPLETION_WAVE_STEP_MS);
        expect(delays?.get(0)).toBe(UNIT_COMPLETION_WAVE_STEP_MS * 8);
    });

    it('merges simultaneous row, column, and box completions from the same origin', () => {
        const previousBoard = [...SOLVED_GRID] as CellValue[];
        previousBoard[40] = 0;
        const nextBoard = [...SOLVED_GRID] as CellValue[];

        const delays = getCompletionWaveDelays(previousBoard, nextBoard, 40);

        expect(delays).not.toBeNull();
        expect(delays?.size).toBe(21);
        expect(delays?.get(40)).toBe(0);
        expect(delays?.get(41)).toBe(UNIT_COMPLETION_WAVE_STEP_MS);
        expect(delays?.get(49)).toBe(UNIT_COMPLETION_WAVE_STEP_MS);
        expect(delays?.get(30)).toBe(UNIT_COMPLETION_WAVE_STEP_MS);
    });

    it('does not animate when the filled unit is invalid', () => {
        const previousBoard = createBoardWithValues([
            [0, 5], [1, 3], [2, 4], [3, 6], [4, 7], [5, 8], [6, 9], [7, 1],
        ]);
        const nextBoard = createBoardWithValues([
            [0, 5], [1, 3], [2, 4], [3, 6], [4, 7], [5, 8], [6, 9], [7, 1], [8, 1],
        ]);

        expect(getCompletionWaveDelays(previousBoard, nextBoard, 8)).toBeNull();
    });
});
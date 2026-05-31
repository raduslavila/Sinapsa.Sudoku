import { describe, expect, it } from 'vitest';
import type { CellValue } from '../engine/types.ts';
import { EASY_PUZZLE, SOLVED_GRID } from '../test/fixtures.ts';
import { getRemainingDigitCounts } from './numberPadCounts.ts';

describe('getRemainingDigitCounts', () => {
    it('returns zero for every digit on a solved board', () => {
        expect(getRemainingDigitCounts(SOLVED_GRID, SOLVED_GRID)).toEqual({
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
        });
    });

    it('counts how many correct placements remain for each digit', () => {
        expect(getRemainingDigitCounts(EASY_PUZZLE, SOLVED_GRID)).toEqual({
            1: 6,
            2: 7,
            3: 6,
            4: 7,
            5: 6,
            6: 4,
            7: 6,
            8: 4,
            9: 5,
        });
    });

    it('ignores wrong digits already on the board', () => {
        const board = [...SOLVED_GRID] as CellValue[];
        board[0] = 9;

        expect(getRemainingDigitCounts(board, SOLVED_GRID)).toEqual({
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 1,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
        });
    });
});
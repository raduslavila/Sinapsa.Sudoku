import { describe, it, expect } from 'vitest';
import {
    getCellIndex,
    getRow,
    getCol,
    getBox,
    getRowCells,
    getColCells,
    getBoxCells,
    getPeerIndices,
    cloneGrid,
} from './grid.ts';
import { SOLVED_GRID } from '../test/fixtures.ts';

describe('getCellIndex', () => {
    it('returns 0 for row 0, col 0', () => {
        expect(getCellIndex(0, 0)).toBe(0);
    });
    it('returns 8 for row 0, col 8', () => {
        expect(getCellIndex(0, 8)).toBe(8);
    });
    it('returns 9 for row 1, col 0', () => {
        expect(getCellIndex(1, 0)).toBe(9);
    });
    it('returns 80 for row 8, col 8', () => {
        expect(getCellIndex(8, 8)).toBe(80);
    });
});

describe('getRow', () => {
    it('returns 0 for index 0', () => expect(getRow(0)).toBe(0));
    it('returns 0 for index 8', () => expect(getRow(8)).toBe(0));
    it('returns 1 for index 9', () => expect(getRow(9)).toBe(1));
    it('returns 8 for index 80', () => expect(getRow(80)).toBe(8));
});

describe('getCol', () => {
    it('returns 0 for index 0', () => expect(getCol(0)).toBe(0));
    it('returns 8 for index 8', () => expect(getCol(8)).toBe(8));
    it('returns 0 for index 9', () => expect(getCol(9)).toBe(0));
    it('returns 8 for index 80', () => expect(getCol(80)).toBe(8));
});

describe('getBox', () => {
    it('returns 0 for index 0 (top-left box)', () => expect(getBox(0)).toBe(0));
    it('returns 0 for index 10 (row 1, col 1 — still box 0)', () => expect(getBox(10)).toBe(0));
    it('returns 1 for index 3 (row 0, col 3)', () => expect(getBox(3)).toBe(1));
    it('returns 4 for index 40 (row 4, col 4 — center box)', () => expect(getBox(40)).toBe(4));
    it('returns 8 for index 80 (row 8, col 8 — bottom-right box)', () => expect(getBox(80)).toBe(8));
});

describe('getRowCells', () => {
    it('returns 9 cells for row 0', () => {
        const row = getRowCells(SOLVED_GRID, 0);
        expect(row).toHaveLength(9);
    });

    it('returns the correct values for row 0', () => {
        expect([...getRowCells(SOLVED_GRID, 0)]).toEqual([5, 3, 4, 6, 7, 8, 9, 1, 2]);
    });

    it('returns the correct values for row 1', () => {
        expect([...getRowCells(SOLVED_GRID, 1)]).toEqual([6, 7, 2, 1, 9, 5, 3, 4, 8]);
    });
});

describe('getColCells', () => {
    it('returns 9 cells for col 0', () => {
        expect(getColCells(SOLVED_GRID, 0)).toHaveLength(9);
    });

    it('returns the correct values for col 0', () => {
        expect([...getColCells(SOLVED_GRID, 0)]).toEqual([5, 6, 1, 8, 4, 7, 9, 2, 3]);
    });
});

describe('getBoxCells', () => {
    it('returns 9 cells for box 0', () => {
        expect(getBoxCells(SOLVED_GRID, 0)).toHaveLength(9);
    });

    it('returns the correct values for box 0 (top-left)', () => {
        // Row 0 cols 0-2: 5,3,4 | Row 1 cols 0-2: 6,7,2 | Row 2 cols 0-2: 1,9,8
        expect([...getBoxCells(SOLVED_GRID, 0)]).toEqual([5, 3, 4, 6, 7, 2, 1, 9, 8]);
    });
});

describe('getPeerIndices', () => {
    it('returns exactly 20 peers for any cell', () => {
        expect(getPeerIndices(0)).toHaveLength(20);
        expect(getPeerIndices(40)).toHaveLength(20);
        expect(getPeerIndices(80)).toHaveLength(20);
    });

    it('does not include the cell itself', () => {
        expect(getPeerIndices(0)).not.toContain(0);
        expect(getPeerIndices(40)).not.toContain(40);
    });

    it('contains no duplicates', () => {
        const peers = getPeerIndices(0);
        expect(new Set(peers).size).toBe(peers.length);
    });
});

describe('cloneGrid', () => {
    it('returns an array with the same values', () => {
        const clone = cloneGrid(SOLVED_GRID);
        expect(clone).toEqual([...SOLVED_GRID]);
    });

    it('returns a new array (not the same reference)', () => {
        const clone = cloneGrid(SOLVED_GRID);
        expect(clone).not.toBe(SOLVED_GRID);
    });

    it('mutations to the clone do not affect the original', () => {
        const clone = cloneGrid(SOLVED_GRID);
        clone[0] = 0;
        expect(SOLVED_GRID[0]).toBe(5);
    });
});

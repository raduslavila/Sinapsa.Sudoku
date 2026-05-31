import { describe, it, expect } from 'vitest';
import type { CellValue, SudokuGrid } from './types.ts';
import { getHint } from './hints.ts';
import { SOLVED_GRID } from '../test/fixtures.ts';

/**
 * Build a SudokuGrid with all cells defaulting to 0, with overrides from `fill`.
 * Keys are cell indices (0–80), values are CellValues.
 */
function makeGrid(fill: Partial<Record<number, CellValue>> = {}): SudokuGrid {
    const g = new Array<CellValue>(81).fill(0);
    for (const [k, v] of Object.entries(fill)) {
        g[Number(k)] = v!;
    }
    return g;
}

describe('getHint', () => {
    it('returns null when the grid is already complete', () => {
        expect(getHint(SOLVED_GRID, SOLVED_GRID)).toBeNull();
    });

    describe('Tier 1 — Full House', () => {
        it('detects the only empty cell in a box', () => {
            // Box 0 cells: 0,1,2,9,10,11,18,19,20. Fill all but cell 20.
            // Rows 0-2 have 6+ empties each so no row full-house fires first.
            const fill: Partial<Record<number, CellValue>> = {};
            [0, 1, 2, 9, 10, 11, 18, 19].forEach(i => { fill[i] = SOLVED_GRID[i]; });
            const hint = getHint(makeGrid(fill), SOLVED_GRID);

            expect(hint).not.toBeNull();
            expect(hint!.technique).toBe('full-house');
            expect(hint!.index).toBe(20);
            expect(hint!.digit).toBe(SOLVED_GRID[20]); // 8
            expect(hint!.reason).toMatch(/box/i);
        });

        it('detects the only empty cell in a row', () => {
            // Fill row 0 cells 0-7; leave cell 8 empty.
            // Each col/box touched has multiple empties so the ROW full-house fires first.
            const fill: Partial<Record<number, CellValue>> = {};
            [0, 1, 2, 3, 4, 5, 6, 7].forEach(i => { fill[i] = SOLVED_GRID[i]; });
            const hint = getHint(makeGrid(fill), SOLVED_GRID);

            expect(hint).not.toBeNull();
            expect(hint!.technique).toBe('full-house');
            expect(hint!.index).toBe(8);
            expect(hint!.digit).toBe(SOLVED_GRID[8]); // 2
            expect(hint!.reason).toMatch(/row/i);
        });
    });

    describe('Tier 2 — Naked Single', () => {
        it('detects a cell with exactly one candidate', () => {
            // Cell 0 (row 0, col 0, box 0) will have candidates = {1}:
            //   Row 0: fill cells 1-7 with digits 2-8 → covers 2,3,4,5,6,7,8
            //   Col 0: fill cell 9 with 9             → covers 9
            //   Box 0 union of row+col covers {2,3,9} → only 1 missing
            // Leave cell 8 empty too so row 0 has 2 empties (no full house).
            const grid = makeGrid({ 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 9: 9 });
            const hint = getHint(grid, SOLVED_GRID);

            expect(hint).not.toBeNull();
            expect(hint!.technique).toBe('naked-single');
            expect(hint!.index).toBe(0);
            expect(hint!.digit).toBe(1);
            expect(hint!.reason).toContain('1');
        });
    });

    describe('Tier 3 — Hidden Single', () => {
        it('detects a digit forced to one cell in a row', () => {
            // Row 0 empties: cells 0, 6, 8. Digit 1 is the only digit available in row 0
            // that fits only in cell 8 (excluded from cell 0 via col 0, from cell 6 via col 6).
            //
            // Filled:
            //   cells 1-5 → digits 2-6 (row 0 partial)
            //   cell 7    → digit 7
            //   cell 9    → digit 1 (row 1 col 0: eliminates 1 from cell 0 through col 0)
            //   cell 33   → digit 1 (row 3 col 6: eliminates 1 from cell 6 through col 6,
            //                         row 3 is outside box 2 so cell 8 keeps 1 as a candidate)
            //
            // Cell 0 candidates = {8,9}  (1 excluded via col 0)
            // Cell 6 candidates = {8,9}  (1 excluded via col 6)
            // Cell 8 candidates = {1,8,9}
            // → digit 1 can only go in cell 8 in row 0
            const grid = makeGrid({ 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 7: 7, 9: 1, 33: 1 });
            const hint = getHint(grid, SOLVED_GRID);

            expect(hint).not.toBeNull();
            expect(hint!.technique).toBe('hidden-single');
            expect(hint!.index).toBe(8);
            expect(hint!.digit).toBe(1);
            expect(hint!.reason).toMatch(/row/i);
        });
    });

    describe('Tier 4 — MRV Fallback', () => {
        it('falls back when no basic technique applies (empty grid)', () => {
            // An empty grid has no full houses, naked singles, or hidden singles.
            // Every cell has 9 candidates, so the first cell (index 0) is returned.
            const hint = getHint(makeGrid(), SOLVED_GRID);

            expect(hint).not.toBeNull();
            expect(hint!.technique).toBe('fallback');
            expect(hint!.index).toBe(0);
            expect(hint!.digit).toBe(SOLVED_GRID[0]); // 5
        });
    });

    it('always populates technique and reason', () => {
        const fill: Partial<Record<number, CellValue>> = {};
        [0, 1, 2, 9, 10, 11, 18, 19].forEach(i => { fill[i] = SOLVED_GRID[i]; });
        const hint = getHint(makeGrid(fill), SOLVED_GRID);

        expect(hint).not.toBeNull();
        expect(typeof hint!.technique).toBe('string');
        expect(typeof hint!.reason).toBe('string');
        expect(hint!.reason.length).toBeGreaterThan(0);
    });
});

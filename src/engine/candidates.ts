import type { CellValue, Digit, SudokuGrid } from './types.ts';
import { getRow, getCol, getBox, getRowCells, getColCells, getBoxCells } from './grid.ts';

const ALL_DIGITS: readonly Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function getCandidates(grid: SudokuGrid, index: number): ReadonlySet<Digit> {
    if (grid[index] !== 0) return new Set<Digit>();

    const row = getRow(index);
    const col = getCol(index);
    const box = getBox(index);

    const used = new Set<CellValue>();
    for (const v of getRowCells(grid, row)) {
        if (v !== 0) used.add(v);
    }
    for (const v of getColCells(grid, col)) {
        if (v !== 0) used.add(v);
    }
    for (const v of getBoxCells(grid, box)) {
        if (v !== 0) used.add(v);
    }

    const candidates = new Set<Digit>();
    for (const d of ALL_DIGITS) {
        if (!used.has(d)) candidates.add(d);
    }
    return candidates;
}

export function getAllCandidates(grid: SudokuGrid): ReadonlyArray<ReadonlySet<Digit>> {
    return grid.map((_, i) => getCandidates(grid, i));
}

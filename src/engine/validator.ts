import type { CellValue, SudokuGrid } from './types.ts';
import { getRowCells, getColCells, getBoxCells, getRow, getCol, getBox, GRID_SIZE, ROW_SIZE } from './grid.ts';

export function isValidCellValue(v: unknown): v is CellValue {
    return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 9;
}

export function isValidGrid(grid: unknown): grid is SudokuGrid {
    return Array.isArray(grid) && grid.length === GRID_SIZE && (grid as unknown[]).every(isValidCellValue);
}

export function hasDuplicates(values: readonly CellValue[]): boolean {
    const seen = new Set<number>();
    for (const v of values) {
        if (v === 0) continue;
        if (seen.has(v)) return true;
        seen.add(v);
    }
    return false;
}

export function isValidSudoku(grid: SudokuGrid): boolean {
    for (let i = 0; i < ROW_SIZE; i++) {
        if (hasDuplicates(getRowCells(grid, i))) return false;
        if (hasDuplicates(getColCells(grid, i))) return false;
        if (hasDuplicates(getBoxCells(grid, i))) return false;
    }
    return true;
}

export function isSolved(grid: SudokuGrid): boolean {
    if (grid.some((v) => v === 0)) return false;
    return isValidSudoku(grid);
}

export function isValidPlacement(grid: SudokuGrid, index: number, digit: number): boolean {
    const row = getRow(index);
    const col = getCol(index);
    const box = getBox(index);

    for (const v of getRowCells(grid, row)) {
        if (v === digit) return false;
    }
    for (const v of getColCells(grid, col)) {
        if (v === digit) return false;
    }
    for (const v of getBoxCells(grid, box)) {
        if (v === digit) return false;
    }
    return true;
}

export function givensSatisfied(puzzle: SudokuGrid, grid: SudokuGrid): boolean {
    for (let i = 0; i < GRID_SIZE; i++) {
        if (puzzle[i] !== 0 && puzzle[i] !== grid[i]) return false;
    }
    return true;
}

import type { CellValue, SudokuGrid } from './types.ts';

const ROW_SIZE = 9;
const BOX_SIZE = 3;
const GRID_SIZE = 81;

export function getCellIndex(row: number, col: number): number {
    return row * ROW_SIZE + col;
}

export function getRow(index: number): number {
    return Math.floor(index / ROW_SIZE);
}

export function getCol(index: number): number {
    return index % ROW_SIZE;
}

export function getBox(index: number): number {
    return Math.floor(getRow(index) / BOX_SIZE) * BOX_SIZE + Math.floor(getCol(index) / BOX_SIZE);
}

export function getRowCells(grid: SudokuGrid, row: number): readonly CellValue[] {
    const start = row * ROW_SIZE;
    return grid.slice(start, start + ROW_SIZE);
}

export function getColCells(grid: SudokuGrid, col: number): readonly CellValue[] {
    const cells: CellValue[] = [];
    for (let r = 0; r < ROW_SIZE; r++) {
        cells.push(grid[r * ROW_SIZE + col]);
    }
    return cells;
}

export function getBoxCells(grid: SudokuGrid, box: number): readonly CellValue[] {
    const boxRow = Math.floor(box / BOX_SIZE) * BOX_SIZE;
    const boxCol = (box % BOX_SIZE) * BOX_SIZE;
    const cells: CellValue[] = [];
    for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
        for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
            cells.push(grid[r * ROW_SIZE + c]);
        }
    }
    return cells;
}

export function getPeerIndices(index: number): readonly number[] {
    const row = getRow(index);
    const col = getCol(index);
    const peers = new Set<number>();

    for (let c = 0; c < ROW_SIZE; c++) {
        peers.add(getCellIndex(row, c));
    }
    for (let r = 0; r < ROW_SIZE; r++) {
        peers.add(getCellIndex(r, col));
    }

    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
        for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
            peers.add(getCellIndex(r, c));
        }
    }

    peers.delete(index);
    return [...peers];
}

export function cloneGrid(grid: SudokuGrid): CellValue[] {
    return [...grid] as CellValue[];
}

export function isEmptyGrid(grid: SudokuGrid): boolean {
    return grid.every((v) => v === 0);
}

export { GRID_SIZE, ROW_SIZE, BOX_SIZE };

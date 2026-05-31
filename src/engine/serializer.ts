import type { CellValue, SudokuGrid } from './types.ts';
import { isValidCellValue, isValidGrid } from './validator.ts';
import { GRID_SIZE } from './grid.ts';

/**
 * Serializes a SudokuGrid to an 81-character string.
 * Each character is a digit 0-9 ('0' = empty).
 */
export function serializeGrid(grid: SudokuGrid): string {
    return grid.join('');
}

/**
 * Deserializes an 81-character string into a SudokuGrid.
 * Throws if the string is not exactly 81 valid digit characters.
 */
export function deserializeGrid(str: string): SudokuGrid {
    if (str.length !== GRID_SIZE) {
        throw new Error(`deserializeGrid: expected 81 characters, got ${str.length}`);
    }

    const cells: CellValue[] = [];
    for (let i = 0; i < str.length; i++) {
        const v = Number(str[i]);
        if (!isValidCellValue(v)) {
            throw new Error(`deserializeGrid: invalid character '${str[i]}' at position ${i}`);
        }
        cells.push(v);
    }

    return cells;
}

/**
 * Returns true if the given string represents a valid grid.
 */
export function isSerializedGridValid(str: string): boolean {
    if (str.length !== GRID_SIZE) return false;
    for (const ch of str) {
        if (!/^[0-9]$/.test(ch)) return false;
    }
    const cells = str.split('').map(Number);
    return isValidGrid(cells);
}

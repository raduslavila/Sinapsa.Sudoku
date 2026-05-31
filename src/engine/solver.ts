import type { CellValue, SudokuGrid } from './types.ts';
import { cloneGrid } from './grid.ts';
import { isValidGrid, isValidSudoku } from './validator.ts';
import { getCandidates } from './candidates.ts';

/**
 * Solves the given puzzle using backtracking with MRV (minimum remaining values) heuristic.
 * Returns the solution grid, or null if no solution exists.
 * Throws if the input is not a valid 81-cell grid.
 */
export function solve(grid: SudokuGrid): SudokuGrid | null {
    if (!isValidGrid(grid)) throw new Error('solve: input is not a valid 81-cell grid');
    if (!isValidSudoku(grid)) return null;

    const cells = cloneGrid(grid);
    return backtrack(cells) ? cells : null;
}

function findMrvIndex(cells: CellValue[]): number {
    let minCount = 10;
    let target = -1;

    for (let i = 0; i < 81; i++) {
        if (cells[i] !== 0) continue;
        const count = getCandidates(cells, i).size;
        if (count === 0) return -2; // No solution possible
        if (count < minCount) {
            minCount = count;
            target = i;
            if (minCount === 1) break;
        }
    }
    return target;
}

function backtrack(cells: CellValue[]): boolean {
    const targetIndex = findMrvIndex(cells);
    if (targetIndex === -2) return false;
    if (targetIndex === -1) return true; // All cells filled

    for (const digit of getCandidates(cells, targetIndex)) {
        cells[targetIndex] = digit;
        if (backtrack(cells)) return true;
        cells[targetIndex] = 0;
    }

    return false;
}

/**
 * Counts solutions up to the given limit.
 * Used internally for uniqueness checking.
 */
function countSolutions(cells: CellValue[], found: number, limit: number): number {
    const targetIndex = findMrvIndex(cells);
    if (targetIndex === -2) return found;
    if (targetIndex === -1) return found + 1;

    for (const digit of getCandidates(cells, targetIndex)) {
        cells[targetIndex] = digit;
        found = countSolutions(cells, found, limit);
        cells[targetIndex] = 0;
        if (found >= limit) return found;
    }

    return found;
}

/**
 * Returns true if the puzzle has exactly one solution.
 * Throws if the input is not a valid 81-cell grid.
 */
export function hasUniqueSolution(grid: SudokuGrid): boolean {
    if (!isValidGrid(grid)) throw new Error('hasUniqueSolution: input is not a valid 81-cell grid');
    if (!isValidSudoku(grid)) return false;
    return countSolutions(cloneGrid(grid), 0, 2) === 1;
}

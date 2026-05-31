import type { Hint, SudokuGrid } from './types.ts';

/**
 * Returns the simplest available hint: the index and correct digit
 * for the first empty cell in the current grid, taken from the solution.
 * Returns null if the puzzle is already complete.
 */
export function getHint(currentGrid: SudokuGrid, solution: SudokuGrid): Hint | null {
    for (let i = 0; i < 81; i++) {
        if (currentGrid[i] === 0) {
            const digit = solution[i];
            if (digit !== 0) {
                return { index: i, digit };
            }
        }
    }
    return null;
}

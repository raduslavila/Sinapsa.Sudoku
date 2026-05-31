import type { SudokuGrid } from '../engine/types.ts';
import { deserializeGrid } from '../engine/serializer.ts';

/**
 * A completely solved 9×9 grid (the solution of EASY_PUZZLE).
 * Row 0: 5 3 4 6 7 8 9 1 2
 * Row 1: 6 7 2 1 9 5 3 4 8
 * Row 2: 1 9 8 3 4 2 5 6 7
 * Row 3: 8 5 9 7 6 1 4 2 3
 * Row 4: 4 2 6 8 5 3 7 9 1
 * Row 5: 7 1 3 9 2 4 8 5 6
 * Row 6: 9 6 1 5 3 7 2 8 4
 * Row 7: 2 8 7 4 1 9 6 3 5
 * Row 8: 3 4 5 2 8 6 1 7 9
 */
export const SOLVED_GRID: SudokuGrid = deserializeGrid(
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
);

/**
 * A well-known easy puzzle (30 givens). Solvable with singles only.
 * Solution is SOLVED_GRID.
 */
export const EASY_PUZZLE: SudokuGrid = deserializeGrid(
    '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
);

/**
 * Arto Inkala's "Al Escargot" — one of the hardest known Sudoku puzzles (23 givens).
 * Confirmed to have exactly one solution. Requires advanced techniques.
 */
export const HARD_PUZZLE: SudokuGrid = deserializeGrid(
    '100007090030020008009600500005300900010080002600004000300000010040000007007000300',
);

/**
 * A puzzle with duplicate digits in row 0 — structurally invalid.
 * isValidSudoku() must return false for this grid.
 */
export const INVALID_PUZZLE: SudokuGrid = deserializeGrid(
    '110000000000000000000000000000000000000000000000000000000000000000000000000000000',
);

/**
 * A near-empty puzzle with multiple solutions.
 * hasUniqueSolution() must return false.
 */
export const MULTI_SOLUTION_PUZZLE: SudokuGrid = deserializeGrid(
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000',
);

// Public engine API — import from here instead of individual modules.

export type { Digit, CellValue, SudokuGrid, DifficultyId, Puzzle, DifficultyRating, Hint } from './types.ts';

export { getCellIndex, getRow, getCol, getBox, getRowCells, getColCells, getBoxCells, getPeerIndices, cloneGrid, isEmptyGrid } from './grid.ts';

export { isValidCellValue, isValidGrid, hasDuplicates, isValidSudoku, isSolved, isValidPlacement, givensSatisfied } from './validator.ts';

export { getCandidates, getAllCandidates } from './candidates.ts';

export { solve, hasUniqueSolution } from './solver.ts';

export { rateDifficulty } from './difficulty.ts';

export { getHint } from './hints.ts';

export { serializeGrid, deserializeGrid, isSerializedGridValid } from './serializer.ts';

export { generatePuzzle } from './generator.ts';

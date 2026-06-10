export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellValue = Digit | 0;
export type SudokuGrid = readonly CellValue[];
export type DifficultyId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type GameMode = 'classic' | 'pen-and-paper';

export interface Puzzle {
    readonly seed: string;
    readonly grid: SudokuGrid;
    readonly solution: SudokuGrid;
    readonly difficultyId: DifficultyId;
    readonly givens: ReadonlySet<number>;
}

export interface DifficultyRating {
    readonly id: DifficultyId;
    readonly givenCount: number;
    readonly score: number;
}

export interface Hint {
    readonly index: number;
    readonly digit: Digit;
    readonly technique: 'full-house' | 'naked-single' | 'hidden-single' | 'fallback';
    readonly reason: string;
}

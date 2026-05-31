import type { CellValue, Digit, DifficultyId, DifficultyRating, SudokuGrid } from './types.ts';
import { cloneGrid, ROW_SIZE, BOX_SIZE } from './grid.ts';
import { getCandidates } from './candidates.ts';
import { isSolved } from './validator.ts';

// ---------------------------------------------------------------------------
// Internal constraint-propagation helpers
// ---------------------------------------------------------------------------

function applyNakedSingles(cells: CellValue[]): boolean {
    let progress = false;
    for (let i = 0; i < 81; i++) {
        if (cells[i] !== 0) continue;
        const candidates = getCandidates(cells, i);
        if (candidates.size === 0) return false; // Invalid board
        if (candidates.size === 1) {
            for (const d of candidates) {
                cells[i] = d;
            }
            progress = true;
        }
    }
    return progress;
}

function applyHiddenSinglesInUnit(cells: CellValue[], indices: readonly number[]): boolean {
    let applied = false;
    for (let d = 1; d <= 9; d++) {
        const digit = d as Digit;
        const possible = indices.filter((i) => cells[i] === 0 && getCandidates(cells, i).has(digit));
        if (possible.length === 1) {
            cells[possible[0]] = digit;
            applied = true;
        }
    }
    return applied;
}

function buildUnitIndices(): ReadonlyArray<readonly number[]> {
    const units: number[][] = [];
    for (let i = 0; i < ROW_SIZE; i++) {
        // Row
        units.push(Array.from({ length: ROW_SIZE }, (_, c) => i * ROW_SIZE + c));
        // Column
        units.push(Array.from({ length: ROW_SIZE }, (_, r) => r * ROW_SIZE + i));
        // Box
        const br = Math.floor(i / BOX_SIZE) * BOX_SIZE;
        const bc = (i % BOX_SIZE) * BOX_SIZE;
        const box: number[] = [];
        for (let r = br; r < br + BOX_SIZE; r++) {
            for (let c = bc; c < bc + BOX_SIZE; c++) {
                box.push(r * ROW_SIZE + c);
            }
        }
        units.push(box);
    }
    return units;
}

const UNIT_INDICES = buildUnitIndices();

function solveWithSingles(grid: SudokuGrid): CellValue[] | null {
    const cells = cloneGrid(grid);
    let globalProgress = true;
    while (globalProgress) {
        globalProgress = false;

        let naked = true;
        while (naked) {
            naked = applyNakedSingles(cells);
            if (naked) globalProgress = true;
        }

        for (const unit of UNIT_INDICES) {
            if (applyHiddenSinglesInUnit(cells, unit)) globalProgress = true;
        }
    }
    return cells;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function rateDifficulty(puzzle: SudokuGrid): DifficultyRating {
    const givenCount = puzzle.filter((v) => v !== 0).length;

    const afterSingles = solveWithSingles(puzzle);
    const singlesComplete = afterSingles !== null && isSolved(afterSingles);

    // Estimate score based on givens and technique requirements
    let id: DifficultyId;
    let score: number;

    if (singlesComplete) {
        // Solvable with naked + hidden singles
        if (givenCount >= 46) {
            id = 1; score = 100;
        } else if (givenCount >= 40) {
            id = 2; score = 200;
        } else if (givenCount >= 32) {
            id = 3; score = 300;
        } else if (givenCount >= 28) {
            id = 4; score = 400;
        } else {
            id = 5; score = 500;
        }
    } else {
        // Needs pairs, triples, or backtracking
        if (givenCount >= 28) {
            id = 5; score = 550;
        } else if (givenCount >= 26) {
            id = 6; score = 600;
        } else if (givenCount >= 24) {
            id = 7; score = 700;
        } else if (givenCount >= 22) {
            id = 8; score = 800;
        } else if (givenCount >= 20) {
            id = 9; score = 900;
        } else {
            id = 10; score = 1000;
        }
    }

    return { id, givenCount, score };
}

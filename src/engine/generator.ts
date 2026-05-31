import type { CellValue, DifficultyId, Puzzle } from './types.ts';
import { cloneGrid } from './grid.ts';
import { getCandidates } from './candidates.ts';
import { hasUniqueSolution } from './solver.ts';

// ---------------------------------------------------------------------------
// Seeded PRNG — Mulberry32
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
    let s = seed >>> 0;
    return function (): number {
        s += 0x6d2b79f5;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Maps a seed string to a 32-bit unsigned integer using djb2.
 */
function seedStringToNumber(seed: string): number {
    let hash = 5381;
    for (let i = 0; i < seed.length; i++) {
        hash = (((hash << 5) + hash) ^ seed.charCodeAt(i)) >>> 0;
    }
    return hash;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
    }
    return out;
}

// ---------------------------------------------------------------------------
// Solved-grid generation
// ---------------------------------------------------------------------------

function fillGrid(cells: CellValue[], rng: () => number): boolean {
    // MRV: find the empty cell with the fewest candidates
    let minCount = 10;
    let target = -1;
    for (let i = 0; i < 81; i++) {
        if (cells[i] !== 0) continue;
        const count = getCandidates(cells, i).size;
        if (count === 0) return false;
        if (count < minCount) {
            minCount = count;
            target = i;
            if (minCount === 1) break;
        }
    }
    if (target === -1) return true; // All filled

    const digits = shuffle([...getCandidates(cells, target)], rng);
    for (const digit of digits) {
        cells[target] = digit;
        if (fillGrid(cells, rng)) return true;
        cells[target] = 0;
    }
    return false;
}

function generateSolution(rng: () => number): CellValue[] {
    const cells: CellValue[] = new Array<CellValue>(81).fill(0);
    fillGrid(cells, rng);
    return cells;
}

// ---------------------------------------------------------------------------
// Puzzle creation via cell removal
// ---------------------------------------------------------------------------

const GIVENS_RANGES: Record<DifficultyId, { min: number; max: number }> = {
    1: { min: 46, max: 54 }, // Beginner
    2: { min: 40, max: 46 }, // Easy
    3: { min: 36, max: 40 }, // Casual
    4: { min: 32, max: 36 }, // Normal
    5: { min: 28, max: 32 }, // Medium
    6: { min: 26, max: 29 }, // Tricky
    7: { min: 24, max: 27 }, // Hard
    8: { min: 22, max: 25 }, // Expert
    9: { min: 21, max: 24 }, // Master
    10: { min: 17, max: 22 }, // Nightmare
};

function removeCells(solution: CellValue[], difficulty: DifficultyId, rng: () => number): CellValue[] {
    const range = GIVENS_RANGES[difficulty];
    const targetGivens = range.min + Math.floor(rng() * (range.max - range.min + 1));

    const puzzle = cloneGrid(solution);
    const order = shuffle(Array.from({ length: 81 }, (_, i) => i), rng);
    let currentGivens = 81;

    for (const idx of order) {
        if (currentGivens <= targetGivens) break;

        const backup = puzzle[idx];
        puzzle[idx] = 0;

        if (hasUniqueSolution(puzzle)) {
            currentGivens--;
        } else {
            puzzle[idx] = backup;
        }
    }

    return puzzle;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a Sudoku puzzle for the given difficulty, using a deterministic
 * seeded RNG so the same seed always produces the same puzzle.
 */
export function generatePuzzle(seed: string, difficulty: DifficultyId): Puzzle {
    const rng = mulberry32(seedStringToNumber(seed));

    const solution = generateSolution(rng);
    const grid = removeCells(solution, difficulty, rng);

    const givens = new Set<number>();
    for (let i = 0; i < 81; i++) {
        if (grid[i] !== 0) givens.add(i);
    }

    return {
        seed,
        grid,
        solution,
        difficultyId: difficulty,
        givens,
    };
}

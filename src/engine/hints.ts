import type { Digit, Hint, SudokuGrid } from './types.ts';
import { getAllCandidates } from './candidates.ts';

const ALL_DIGITS: readonly Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** All 9 cell indices for a given row (0-based). */
function rowIndices(r: number): number[] {
    return Array.from({ length: 9 }, (_, c) => r * 9 + c);
}

/** All 9 cell indices for a given column (0-based). */
function colIndices(c: number): number[] {
    return Array.from({ length: 9 }, (_, r) => r * 9 + c);
}

/** All 9 cell indices for a given box (0-based, row-major order). */
function boxIndices(b: number): number[] {
    const br = Math.floor(b / 3) * 3;
    const bc = (b % 3) * 3;
    const out: number[] = [];
    for (let r = br; r < br + 3; r++) {
        for (let c = bc; c < bc + 3; c++) {
            out.push(r * 9 + c);
        }
    }
    return out;
}

/**
 * Returns the most obvious available hint using a 4-tier strategy:
 *
 * 1. **Full House** — only one empty cell remains in a unit (row/col/box).
 * 2. **Naked Single** — only one candidate digit fits in a cell.
 * 3. **Hidden Single** — a digit has exactly one possible cell in a unit.
 * 4. **MRV Fallback** — cell with the fewest remaining candidates.
 *
 * Returns null if the puzzle is already complete.
 */
export function getHint(currentGrid: SudokuGrid, solution: SudokuGrid): Hint | null {
    const allCandidates = getAllCandidates(currentGrid);

    // Tier 1: Full House — exactly one empty cell in a unit
    for (let r = 0; r < 9; r++) {
        const empty = rowIndices(r).filter(i => currentGrid[i] === 0);
        if (empty.length === 1) {
            const i = empty[0];
            const d = solution[i];
            if (d !== 0) return { index: i, digit: d, technique: 'full-house', reason: `Only empty cell in row ${r + 1}` };
        }
    }
    for (let c = 0; c < 9; c++) {
        const empty = colIndices(c).filter(i => currentGrid[i] === 0);
        if (empty.length === 1) {
            const i = empty[0];
            const d = solution[i];
            if (d !== 0) return { index: i, digit: d, technique: 'full-house', reason: `Only empty cell in column ${c + 1}` };
        }
    }
    for (let b = 0; b < 9; b++) {
        const empty = boxIndices(b).filter(i => currentGrid[i] === 0);
        if (empty.length === 1) {
            const i = empty[0];
            const d = solution[i];
            if (d !== 0) return { index: i, digit: d, technique: 'full-house', reason: `Only empty cell in box ${b + 1}` };
        }
    }

    // Tier 2: Naked Single — exactly one candidate in a cell
    for (let i = 0; i < 81; i++) {
        if (currentGrid[i] === 0 && allCandidates[i].size === 1) {
            const digit = [...allCandidates[i]][0] as Digit;
            return { index: i, digit, technique: 'naked-single', reason: `Only ${digit} fits in this cell` };
        }
    }

    // Tier 3: Hidden Single — a digit has only one possible cell in a unit
    // Rows are checked first as they are the most visually scannable for humans.
    const findHiddenSingle = (indices: number[], unitName: string): Hint | null => {
        for (const d of ALL_DIGITS) {
            const possible = indices.filter(i => currentGrid[i] === 0 && allCandidates[i].has(d));
            if (possible.length === 1) {
                const i = possible[0];
                return { index: i, digit: d, technique: 'hidden-single', reason: `${d} can only go here in ${unitName}` };
            }
        }
        return null;
    };
    for (let r = 0; r < 9; r++) {
        const h = findHiddenSingle(rowIndices(r), `row ${r + 1}`);
        if (h) return h;
    }
    for (let c = 0; c < 9; c++) {
        const h = findHiddenSingle(colIndices(c), `column ${c + 1}`);
        if (h) return h;
    }
    for (let b = 0; b < 9; b++) {
        const h = findHiddenSingle(boxIndices(b), `box ${b + 1}`);
        if (h) return h;
    }

    // Tier 4: MRV Fallback — cell with fewest candidates
    let bestIndex = -1;
    let bestCount = 10;
    for (let i = 0; i < 81; i++) {
        if (currentGrid[i] === 0) {
            const count = allCandidates[i].size;
            if (count > 0 && count < bestCount) {
                bestCount = count;
                bestIndex = i;
            }
        }
    }
    if (bestIndex !== -1) {
        const d = solution[bestIndex];
        if (d !== 0) {
            const s = bestCount === 1 ? '' : 's';
            return { index: bestIndex, digit: d, technique: 'fallback', reason: `Fewest options — ${bestCount} candidate${s}` };
        }
    }

    // Last resort: first empty cell (defensive against corrupted candidate state)
    for (let i = 0; i < 81; i++) {
        if (currentGrid[i] === 0) {
            const d = solution[i];
            if (d !== 0) return { index: i, digit: d, technique: 'fallback', reason: 'Next empty cell' };
        }
    }

    return null;
}

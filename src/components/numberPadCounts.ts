import type { CellValue, Digit } from '../engine/types.ts';

export type RemainingDigitCounts = Readonly<Record<Digit, number>>;

export function getRemainingDigitCounts(
    board: readonly CellValue[],
    solution: readonly CellValue[],
): RemainingDigitCounts {
    const counts: Record<Digit, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
    };

    for (let index = 0; index < solution.length; index++) {
        const digit = solution[index];
        if (digit !== 0 && board[index] !== digit) {
            counts[digit] += 1;
        }
    }

    return counts;
}
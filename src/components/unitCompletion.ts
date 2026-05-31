import { getBox, getCol, getRow } from '../engine/grid.ts';
import type { CellValue } from '../engine/types.ts';
import { hasDuplicates } from '../engine/validator.ts';

export const UNIT_COMPLETION_WAVE_STEP_MS = 55;

type UnitKind = 'row' | 'col' | 'box';

interface UnitDescriptor {
    readonly kind: UnitKind;
    readonly indices: readonly number[];
}

function getChangedIndices(previousBoard: readonly CellValue[], nextBoard: readonly CellValue[]): readonly number[] {
    const changed: number[] = [];
    for (let index = 0; index < previousBoard.length; index++) {
        if (previousBoard[index] !== nextBoard[index]) changed.push(index);
    }
    return changed;
}

function getRowIndices(row: number): readonly number[] {
    return Array.from({ length: 9 }, (_, offset) => row * 9 + offset);
}

function getColIndices(col: number): readonly number[] {
    return Array.from({ length: 9 }, (_, offset) => offset * 9 + col);
}

function getBoxIndices(box: number): readonly number[] {
    const startRow = Math.floor(box / 3) * 3;
    const startCol = (box % 3) * 3;
    const indices: number[] = [];

    for (let row = startRow; row < startRow + 3; row++) {
        for (let col = startCol; col < startCol + 3; col++) {
            indices.push(row * 9 + col);
        }
    }

    return indices;
}

function isCompletedUnit(board: readonly CellValue[], unitIndices: readonly number[]): boolean {
    const values = unitIndices.map((index) => board[index]);
    return values.every((value) => value !== 0) && !hasDuplicates(values);
}

function getWaveDistance(kind: UnitKind, originIndex: number, targetIndex: number): number {
    const originRow = getRow(originIndex);
    const originCol = getCol(originIndex);
    const targetRow = getRow(targetIndex);
    const targetCol = getCol(targetIndex);

    if (kind === 'row') return Math.abs(originCol - targetCol);
    if (kind === 'col') return Math.abs(originRow - targetRow);
    return Math.max(Math.abs(originRow - targetRow), Math.abs(originCol - targetCol));
}

function getCandidateUnits(originIndex: number): readonly UnitDescriptor[] {
    return [
        { kind: 'row', indices: getRowIndices(getRow(originIndex)) },
        { kind: 'col', indices: getColIndices(getCol(originIndex)) },
        { kind: 'box', indices: getBoxIndices(getBox(originIndex)) },
    ];
}

export function getCompletionWaveDelays(
    previousBoard: readonly CellValue[],
    nextBoard: readonly CellValue[],
    originIndex: number | null,
): ReadonlyMap<number, number> | null {
    if (originIndex === null) return null;

    const changedIndices = getChangedIndices(previousBoard, nextBoard);
    if (changedIndices.length !== 1 || changedIndices[0] !== originIndex || nextBoard[originIndex] === 0) {
        return null;
    }

    const completedUnits = getCandidateUnits(originIndex).filter(
        (unit) => isCompletedUnit(nextBoard, unit.indices) && !isCompletedUnit(previousBoard, unit.indices),
    );

    if (completedUnits.length === 0) return null;

    const delays = new Map<number, number>();

    for (const unit of completedUnits) {
        for (const index of unit.indices) {
            const delay = getWaveDistance(unit.kind, originIndex, index) * UNIT_COMPLETION_WAVE_STEP_MS;
            const currentDelay = delays.get(index);
            if (currentDelay === undefined || delay < currentDelay) {
                delays.set(index, delay);
            }
        }
    }

    return delays;
}
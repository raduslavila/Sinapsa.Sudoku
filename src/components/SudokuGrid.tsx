import { useCallback, useEffect } from 'react';
import type { CellValue, Digit } from '../engine/types.ts';
import { getPeerIndices } from '../engine/grid.ts';
import { SudokuCell } from './SudokuCell.tsx';

interface Props {
    board: readonly CellValue[];
    solution: readonly CellValue[];
    givens: ReadonlySet<number>;
    notes: ReadonlyMap<number, ReadonlySet<Digit>>;
    selectedIndex: number | null;
    hintedIndices: ReadonlySet<number>;
    onSelectCell: (index: number) => void;
    onDigitInput: (digit: Digit) => void;
    onClear: () => void;
}

function buildConflicts(board: readonly CellValue[]): Set<number> {
    const conflicts = new Set<number>();
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0) continue;
        const peers = getPeerIndices(i);
        for (const peer of peers) {
            if (board[peer] === board[i]) {
                conflicts.add(i);
                conflicts.add(peer);
            }
        }
    }
    return conflicts;
}

/**
 * For a given cell, returns the subset of its pencil-mark digits that
 * already appear in a peer cell's placed value — these should be highlighted
 * in red to warn the player.
 */
function getConflictingNotes(
    board: readonly CellValue[],
    cellNotes: ReadonlySet<Digit>,
    cellIndex: number,
): Set<Digit> {
    const result = new Set<Digit>();
    if (cellNotes.size === 0) return result;
    for (const peer of getPeerIndices(cellIndex)) {
        const peerVal = board[peer];
        if (peerVal !== 0 && cellNotes.has(peerVal as Digit)) {
            result.add(peerVal as Digit);
        }
    }
    return result;
}

const DIGIT_KEYS: Record<string, Digit> = {
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9,
};

export function SudokuGrid({
    board,
    solution,
    givens,
    notes,
    selectedIndex,
    hintedIndices,
    onSelectCell,
    onDigitInput,
    onClear,
}: Props) {
    const peers = selectedIndex !== null ? new Set(getPeerIndices(selectedIndex)) : new Set<number>();
    const conflicts = buildConflicts(board);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key in DIGIT_KEYS) {
                onDigitInput(DIGIT_KEYS[e.key]);
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                onClear();
            } else if (e.key === 'ArrowRight' && selectedIndex !== null) {
                onSelectCell(Math.min(80, selectedIndex + 1));
            } else if (e.key === 'ArrowLeft' && selectedIndex !== null) {
                onSelectCell(Math.max(0, selectedIndex - 1));
            } else if (e.key === 'ArrowDown' && selectedIndex !== null) {
                onSelectCell(Math.min(80, selectedIndex + 9));
            } else if (e.key === 'ArrowUp' && selectedIndex !== null) {
                onSelectCell(Math.max(0, selectedIndex - 9));
            }
        },
        [selectedIndex, onDigitInput, onClear, onSelectCell],
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div
            role="grid"
            aria-label="Sudoku board"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(9, var(--cell-size))',
                gridTemplateRows: 'repeat(9, var(--cell-size))',
                width: 'calc(var(--cell-size) * 9)',
                margin: '0 auto',
            }}
        >
            {board.map((value, i) => {
                const cellNotes = notes.get(i) ?? new Set<Digit>();
                return (
                    <SudokuCell
                        key={i}
                        index={i}
                        value={value}
                        isGiven={givens.has(i)}
                        isSelected={selectedIndex === i}
                        isPeer={selectedIndex !== null && selectedIndex !== i && peers.has(i)}
                        isConflict={conflicts.has(i)}
                        isWrong={!givens.has(i) && value !== 0 && value !== solution[i]}
                        isHinted={hintedIndices.has(i)}
                        notes={cellNotes}
                        conflictingNotes={getConflictingNotes(board, cellNotes, i)}
                        onClick={onSelectCell}
                    />
                );
            })}
        </div>
    );
}

import { describe, it, expect } from 'vitest';
import type { Puzzle } from '../engine/types.ts';
import {
    createGame,
    selectCell,
    placeDigit,
    clearCell,
    toggleNote,
    setNotesMode,
    undo,
    redo,
    pause,
    resume,
    applyHint,
    getElapsedMs,
    IDLE_STATE,
} from './gameState.ts';
import { EASY_PUZZLE, SOLVED_GRID } from '../test/fixtures.ts';

// ---------------------------------------------------------------------------
// Test fixture — a Puzzle object backed by EASY_PUZZLE / SOLVED_GRID
// ---------------------------------------------------------------------------

const GIVENS = new Set<number>(
    EASY_PUZZLE.reduce<number[]>((acc, v, i) => {
        if (v !== 0) acc.push(i);
        return acc;
    }, []),
);

const TEST_PUZZLE: Puzzle = {
    seed: 'test-seed',
    grid: EASY_PUZZLE,
    solution: SOLVED_GRID,
    difficultyId: 2,
    givens: GIVENS,
};

// Known empty cells in EASY_PUZZLE (value=0) and their correct solution digit:
//   index 2  → solution digit 4
//   index 3  → solution digit 6
// Known given cell:
//   index 0  → given digit 5

const NOW = 1000; // fixed timestamp for deterministic tests

function freshGame(mistakeLimit: number | null = null) {
    return createGame(TEST_PUZZLE, mistakeLimit, NOW);
}

function withSelection(index: number, mistakeLimit: number | null = null) {
    return selectCell(freshGame(mistakeLimit), index);
}

// ---------------------------------------------------------------------------
// createGame
// ---------------------------------------------------------------------------

describe('createGame', () => {
    it('returns status playing', () => {
        expect(freshGame().status).toBe('playing');
    });

    it('board matches puzzle grid', () => {
        expect([...freshGame().board]).toEqual([...EASY_PUZZLE]);
    });

    it('starts with zero mistakes', () => {
        expect(freshGame().mistakeCount).toBe(0);
    });

    it('stores the provided mistake limit', () => {
        expect(freshGame(3).mistakeLimit).toBe(3);
        expect(freshGame(null).mistakeLimit).toBeNull();
    });

    it('starts with empty undo/redo stacks', () => {
        const g = freshGame();
        expect(g.undoStack).toHaveLength(0);
        expect(g.redoStack).toHaveLength(0);
    });

    it('records startedAt', () => {
        expect(freshGame().startedAt).toBe(NOW);
    });
});

// ---------------------------------------------------------------------------
// selectCell
// ---------------------------------------------------------------------------

describe('selectCell', () => {
    it('sets selectedIndex', () => {
        const g = selectCell(freshGame(), 5);
        expect(g.selectedIndex).toBe(5);
    });

    it('ignores out-of-range index', () => {
        const g = freshGame();
        expect(selectCell(g, -1).selectedIndex).toBeNull();
        expect(selectCell(g, 81).selectedIndex).toBeNull();
    });

    it('is allowed while paused', () => {
        const g = pause(freshGame(), NOW);
        expect(selectCell(g, 5).selectedIndex).toBe(5);
    });

    it('is blocked while won — selection does not change', () => {
        // Build a custom puzzle that is one move from complete
        const almostSolved = [...SOLVED_GRID] as import('../engine/types.ts').CellValue[];
        almostSolved[0] = 0;
        const puzzle: Puzzle = {
            seed: 'near-win',
            grid: almostSolved,
            solution: SOLVED_GRID,
            difficultyId: 1,
            givens: new Set(almostSolved.reduce<number[]>((a, v, i) => { if (v !== 0) a.push(i); return a; }, [])),
        };
        const won = placeDigit(selectCell(createGame(puzzle, null, NOW), 0), 5);
        expect(won.status).toBe('won');
        // selectedIndex before win was 0; trying to move it to 3 should be blocked
        const after = selectCell(won, 3);
        expect(after.selectedIndex).toBe(0); // unchanged
    });
});

// ---------------------------------------------------------------------------
// placeDigit
// ---------------------------------------------------------------------------

describe('placeDigit', () => {
    it('places a correct digit on the board', () => {
        const g = placeDigit(withSelection(2), 4); // index 2 → solution is 4
        expect(g.board[2]).toBe(4);
    });

    it('does not count a correct placement as a mistake', () => {
        const g = placeDigit(withSelection(2), 4);
        expect(g.mistakeCount).toBe(0);
    });

    it('counts a wrong digit as a mistake', () => {
        const g = placeDigit(withSelection(2), 1); // 1 is wrong at index 2
        expect(g.mistakeCount).toBe(1);
    });

    it('still places a wrong digit on the board', () => {
        const g = placeDigit(withSelection(2), 1);
        expect(g.board[2]).toBe(1);
    });

    it('triggers game over when mistake count reaches the limit', () => {
        const g = placeDigit(withSelection(2, 1), 1); // limit=1, one wrong → over
        expect(g.status).toBe('over');
    });

    it('does not trigger game over while below the limit', () => {
        const g = placeDigit(withSelection(2, 3), 1); // limit=3, one wrong → still playing
        expect(g.status).toBe('playing');
    });

    it('detects win when last cell is filled correctly', () => {
        const almostSolved = [...SOLVED_GRID] as import('../engine/types.ts').CellValue[];
        almostSolved[0] = 0;
        const puzzle: Puzzle = {
            seed: 'near-win',
            grid: almostSolved,
            solution: SOLVED_GRID,
            difficultyId: 1,
            givens: new Set(almostSolved.reduce<number[]>((a, v, i) => { if (v !== 0) a.push(i); return a; }, [])),
        };
        const g = placeDigit(selectCell(createGame(puzzle, null, NOW), 0), 5);
        expect(g.status).toBe('won');
    });

    it('does not change a given cell', () => {
        // Index 0 is a given (5 in EASY_PUZZLE)
        const g = placeDigit(withSelection(0), 9);
        expect(g.board[0]).toBe(5);
        expect(g.mistakeCount).toBe(0);
    });

    it('is a no-op when the same digit is already in the cell', () => {
        const g1 = placeDigit(withSelection(2), 4);
        const g2 = placeDigit(selectCell(g1, 2), 4); // place same digit again
        expect(g2.undoStack.length).toBe(g1.undoStack.length);
    });

    it('is a no-op when status is not playing', () => {
        const paused = pause(withSelection(2), NOW);
        expect(placeDigit(paused, 4).board[2]).toBe(0);
    });

    it('pushes to undoStack', () => {
        const g = placeDigit(withSelection(2), 4);
        expect(g.undoStack).toHaveLength(1);
    });

    it('clears redoStack', () => {
        const g0 = placeDigit(withSelection(2), 4);
        const g1 = undo(g0);
        const g2 = placeDigit(selectCell(g1, 3), 6);
        expect(g2.redoStack).toHaveLength(0);
    });

    it('removes the placed digit from peer cell notes', () => {
        // Add note 4 to index 3 (a peer of index 2 in the same row)
        const g0 = toggleNote(withSelection(3), 4);
        expect(g0.notes.get(3)?.has(4)).toBe(true);

        // Now place digit 4 at index 2; index 3 is a row peer, so note should be cleared
        const g1 = placeDigit(selectCell(g0, 2), 4);
        expect(g1.notes.get(3)?.has(4)).toBeFalsy();
    });
});

// ---------------------------------------------------------------------------
// clearCell
// ---------------------------------------------------------------------------

describe('clearCell', () => {
    it('clears a digit from the selected cell', () => {
        const g0 = placeDigit(withSelection(2), 4);
        const g1 = clearCell(selectCell(g0, 2));
        expect(g1.board[2]).toBe(0);
    });

    it('clears notes from the selected cell', () => {
        const g0 = toggleNote(withSelection(2), 4);
        const g1 = clearCell(selectCell(g0, 2));
        expect(g1.notes.get(2)).toBeUndefined();
    });

    it('does not clear a given cell', () => {
        const g = clearCell(withSelection(0)); // index 0 is a given
        expect(g.board[0]).toBe(5);
    });

    it('is a no-op on an already empty cell with no notes', () => {
        const g = freshGame();
        const before = selectCell(g, 2);
        const after = clearCell(before);
        expect(after.undoStack).toHaveLength(0);
    });

    it('pushes to undoStack', () => {
        const g0 = placeDigit(withSelection(2), 4);
        const g1 = clearCell(selectCell(g0, 2));
        expect(g1.undoStack.length).toBeGreaterThan(0);
    });
});

// ---------------------------------------------------------------------------
// toggleNote
// ---------------------------------------------------------------------------

describe('toggleNote', () => {
    it('adds a note to an empty cell', () => {
        const g = toggleNote(withSelection(2), 4);
        expect(g.notes.get(2)?.has(4)).toBe(true);
    });

    it('removes a note that is already present', () => {
        const g0 = toggleNote(withSelection(2), 4);
        const g1 = toggleNote(selectCell(g0, 2), 4);
        expect(g1.notes.get(2)?.has(4)).toBeFalsy();
    });

    it('can have multiple notes on one cell', () => {
        const g0 = toggleNote(withSelection(2), 4);
        const g1 = toggleNote(selectCell(g0, 2), 6);
        expect(g1.notes.get(2)?.has(4)).toBe(true);
        expect(g1.notes.get(2)?.has(6)).toBe(true);
    });

    it('does not allow notes on a given cell', () => {
        const g = toggleNote(withSelection(0), 5); // index 0 is given
        expect(g.notes.get(0)).toBeUndefined();
    });

    it('does not allow notes on a filled (non-given) cell', () => {
        const g0 = placeDigit(withSelection(2), 4);
        const g1 = toggleNote(selectCell(g0, 2), 6);
        expect(g1.notes.get(2)).toBeUndefined();
    });

    it('pushes to undoStack', () => {
        const g = toggleNote(withSelection(2), 4);
        expect(g.undoStack).toHaveLength(1);
    });
});

// ---------------------------------------------------------------------------
// setNotesMode
// ---------------------------------------------------------------------------

describe('setNotesMode', () => {
    it('enables notes mode', () => {
        expect(setNotesMode(freshGame(), true).notesMode).toBe(true);
    });

    it('disables notes mode', () => {
        const g = setNotesMode(freshGame(), true);
        expect(setNotesMode(g, false).notesMode).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// undo / redo
// ---------------------------------------------------------------------------

describe('undo', () => {
    it('restores the previous board', () => {
        const g0 = withSelection(2);
        const g1 = placeDigit(g0, 4);
        const g2 = undo(g1);
        expect(g2.board[2]).toBe(0);
    });

    it('pushes to redoStack', () => {
        const g1 = placeDigit(withSelection(2), 4);
        const g2 = undo(g1);
        expect(g2.redoStack).toHaveLength(1);
    });

    it('shrinks undoStack', () => {
        const g1 = placeDigit(withSelection(2), 4);
        const g2 = undo(g1);
        expect(g2.undoStack).toHaveLength(0);
    });

    it('is a no-op when undoStack is empty', () => {
        const g = freshGame();
        expect(undo(g)).toBe(g);
    });

    it('is a no-op when game is paused', () => {
        const g1 = placeDigit(withSelection(2), 4);
        const g2 = pause(g1, NOW + 100);
        expect(undo(g2).board[2]).toBe(4); // board unchanged
    });

    it('restores notes', () => {
        const g0 = toggleNote(withSelection(2), 4);
        const g1 = toggleNote(selectCell(g0, 2), 4); // removes note
        const g2 = undo(g1);
        expect(g2.notes.get(2)?.has(4)).toBe(true);
    });
});

describe('redo', () => {
    it('reapplies an undone move', () => {
        const g1 = placeDigit(withSelection(2), 4);
        const g2 = undo(g1);
        const g3 = redo(g2);
        expect(g3.board[2]).toBe(4);
    });

    it('shrinks redoStack', () => {
        const g1 = placeDigit(withSelection(2), 4);
        const g2 = undo(g1);
        const g3 = redo(g2);
        expect(g3.redoStack).toHaveLength(0);
    });

    it('is a no-op when redoStack is empty', () => {
        const g = freshGame();
        expect(redo(g)).toBe(g);
    });
});

// ---------------------------------------------------------------------------
// pause / resume
// ---------------------------------------------------------------------------

describe('pause', () => {
    it('changes status to paused', () => {
        expect(pause(freshGame(), NOW + 500).status).toBe('paused');
    });

    it('accumulates elapsed time', () => {
        const g = pause(freshGame(), NOW + 2000);
        expect(g.elapsedMs).toBe(2000);
    });

    it('clears startedAt', () => {
        expect(pause(freshGame(), NOW + 500).startedAt).toBeNull();
    });

    it('is a no-op when already paused', () => {
        const g = pause(freshGame(), NOW + 500);
        expect(pause(g, NOW + 1000).status).toBe('paused');
    });
});

describe('resume', () => {
    it('changes status to playing', () => {
        const g = resume(pause(freshGame(), NOW + 500), NOW + 1000);
        expect(g.status).toBe('playing');
    });

    it('sets startedAt to now', () => {
        const g = resume(pause(freshGame(), NOW + 500), NOW + 1000);
        expect(g.startedAt).toBe(NOW + 1000);
    });

    it('is a no-op when status is playing', () => {
        const g = freshGame();
        expect(resume(g, NOW + 500).status).toBe('playing');
        expect(resume(g, NOW + 500).startedAt).toBe(NOW); // unchanged
    });
});

// ---------------------------------------------------------------------------
// getElapsedMs
// ---------------------------------------------------------------------------

describe('getElapsedMs', () => {
    it('accumulates time while playing', () => {
        const g = freshGame(); // startedAt = NOW
        expect(getElapsedMs(g, NOW + 3000)).toBe(3000);
    });

    it('returns frozen elapsed when paused', () => {
        const g = pause(freshGame(), NOW + 2000); // elapsedMs = 2000
        expect(getElapsedMs(g, NOW + 9999)).toBe(2000);
    });

    it('accumulates correctly after resume', () => {
        const g0 = freshGame();
        const g1 = pause(g0, NOW + 2000);        // elapsed = 2000
        const g2 = resume(g1, NOW + 5000);        // resumed at +5000
        expect(getElapsedMs(g2, NOW + 6000)).toBe(3000); // 2000 + 1000
    });
});

// ---------------------------------------------------------------------------
// applyHint
// ---------------------------------------------------------------------------

describe('applyHint', () => {
    it('fills one empty cell with the correct solution digit', () => {
        const g = applyHint(freshGame());
        // At least one previously empty cell should now be filled
        const filledCount = g.board.filter((v, i) => v !== 0 && EASY_PUZZLE[i] === 0).length;
        expect(filledCount).toBeGreaterThanOrEqual(1);
    });

    it('does not count a hint placement as a mistake', () => {
        expect(applyHint(freshGame()).mistakeCount).toBe(0);
    });

    it('is a no-op when status is not playing', () => {
        const g = pause(freshGame(), NOW);
        expect(applyHint(g).board).toEqual(g.board);
    });
});

// ---------------------------------------------------------------------------
// IDLE_STATE
// ---------------------------------------------------------------------------

describe('IDLE_STATE', () => {
    it('has status idle', () => {
        expect(IDLE_STATE.status).toBe('idle');
    });

    it('actions on IDLE_STATE return the same object (no-ops)', () => {
        expect(placeDigit(IDLE_STATE, 5)).toBe(IDLE_STATE);
        expect(clearCell(IDLE_STATE)).toBe(IDLE_STATE);
        expect(undo(IDLE_STATE)).toBe(IDLE_STATE);
        expect(redo(IDLE_STATE)).toBe(IDLE_STATE);
    });
});

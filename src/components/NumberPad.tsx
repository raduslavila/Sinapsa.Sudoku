import type { Digit } from '../engine/types.ts';

interface Props {
    onDigit: (d: Digit) => void;
    onClear: () => void;
    onUndo: () => void;
    onHintSelect: () => void;
    onHintApply: () => void;
    notesMode: boolean;
    onToggleNotes: () => void;
    disabled: boolean;
}

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const btnBase: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1 / 1.35',
    borderRadius: 8,
    background: 'var(--color-btn-bg)',
    fontSize: 'clamp(18px, 5vw, 28px)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-given)',
    transition: 'background 0.1s',
    border: '2px solid transparent',
};

const actionBtn: React.CSSProperties = {
    ...btnBase,
    fontSize: 'clamp(11px, 3vw, 15px)',
    fontWeight: '500',
};

export function NumberPad({
    onDigit,
    onClear,
    onUndo,
    onHintSelect,
    onHintApply,
    notesMode,
    onToggleNotes,
    disabled,
}: Props) {
    return (
        <div
            aria-label="Number pad"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(9, 1fr)',
                gap: 6,
                padding: '0 8px',
                width: '100%',
                maxWidth: 'calc(var(--cell-size) * 9)',
                margin: '4px auto',
            }}
        >
            {/* Digit row */}
            {DIGITS.map((d) => (
                <button
                    key={d}
                    type="button"
                    aria-label={`Place ${d}`}
                    disabled={disabled}
                    onClick={() => onDigit(d)}
                    style={btnBase}
                >
                    {d}
                </button>
            ))}

            {/* Action row — 5 buttons spanning all 9 columns */}
            <div
                style={{
                    gridColumn: '1 / -1',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 6,
                }}
            >
                <button
                    type="button"
                    aria-label="Undo"
                    disabled={disabled}
                    onClick={onUndo}
                    style={actionBtn}
                >
                    Undo
                </button>

                <button
                    type="button"
                    aria-label="Erase"
                    disabled={disabled}
                    onClick={onClear}
                    style={actionBtn}
                >
                    Erase
                </button>

                <button
                    type="button"
                    aria-label={notesMode ? 'Notes on — click to turn off' : 'Notes off — click to turn on'}
                    aria-pressed={notesMode}
                    disabled={disabled}
                    onClick={onToggleNotes}
                    style={{
                        ...actionBtn,
                        background: notesMode ? 'var(--color-selected)' : 'var(--color-btn-bg)',
                        border: notesMode ? '2px solid var(--color-primary)' : '2px solid transparent',
                        color: notesMode ? 'var(--color-primary)' : 'var(--color-given)',
                    }}
                >
                    Notes
                </button>

                <button
                    type="button"
                    aria-label="Hint — highlight the next cell to fill"
                    disabled={disabled}
                    onClick={onHintSelect}
                    style={actionBtn}
                >
                    Hint
                </button>

                <button
                    type="button"
                    aria-label="Hint+ — fill the next cell with the correct digit"
                    disabled={disabled}
                    onClick={onHintApply}
                    style={{
                        ...actionBtn,
                        border: '2px solid var(--color-hint)',
                        color: 'var(--color-hint)',
                    }}
                >
                    Hint+
                </button>
            </div>
        </div>
    );
}

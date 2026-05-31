import type { Digit } from '../engine/types.ts';
import type { RemainingDigitCounts } from './numberPadCounts.ts';

interface Props {
    onDigit: (d: Digit) => void;
    onClear: () => void;
    onUndo: () => void;
    onHintSelect: () => void;
    onHintApply: () => void;
    notesMode: boolean;
    onToggleNotes: () => void;
    disabled: boolean;
    remainingHints: number | null;
    remainingDigitCounts: RemainingDigitCounts;
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
    position: 'relative',
};

const actionBtn: React.CSSProperties = {
    ...btnBase,
    fontSize: 'clamp(11px, 3vw, 15px)',
    fontWeight: '500',
};

const digitBadge: React.CSSProperties = {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 14,
    height: 14,
    padding: '0 3px',
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-selected)',
    color: 'var(--color-primary)',
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 1,
};

const hintBadge: React.CSSProperties = {
    ...digitBadge,
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    padding: '0 4px',
    fontSize: 9,
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
    remainingHints,
    remainingDigitCounts,
}: Props) {
    const hintsUnavailable = remainingHints === 0;
    const hintDisabled = disabled || hintsUnavailable;
    const hintLabelSuffix = remainingHints === null ? '' : ` (${remainingHints} left)`;

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
                    aria-label={`Place ${d} (${remainingDigitCounts[d]} left)`}
                    disabled={disabled || remainingDigitCounts[d] === 0}
                    onClick={() => onDigit(d)}
                    style={{
                        ...btnBase,
                    }}
                >
                    <span>{d}</span>
                    <span aria-hidden="true" style={digitBadge}>
                        {remainingDigitCounts[d]}
                    </span>
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
                    aria-label={`Hint — highlight the next cell to fill${hintLabelSuffix}`}
                    disabled={hintDisabled}
                    onClick={onHintSelect}
                    style={actionBtn}
                >
                    <span>Hint</span>
                    {remainingHints !== null && (
                        <span aria-hidden="true" style={hintBadge}>
                            {remainingHints}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    aria-label={`Hint+ — fill the next cell with the correct digit${hintLabelSuffix}`}
                    disabled={hintDisabled}
                    onClick={onHintApply}
                    style={{
                        ...actionBtn,
                        color: 'var(--color-primary)',
                    }}
                >
                    <span>Hint+</span>
                    {remainingHints !== null && (
                        <span aria-hidden="true" style={hintBadge}>
                            {remainingHints}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

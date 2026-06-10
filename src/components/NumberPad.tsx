import type { Digit } from '../engine/types.ts';
import type { RemainingDigitCounts } from './numberPadCounts.ts';
import { useSettingsStore } from '../state/settingsStore.ts';

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
    /** When true, applies pen-and-paper mode rules (no hints, no badges, Submit Solution). */
    isPenAndPaper?: boolean;
    /** When true (P&P mode only), shows the Submit Solution button. */
    allCellsFilled?: boolean;
    /** Called when the user presses Submit Solution (P&P mode only). */
    onSubmitSolution?: () => void;
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
    top: 1,
    right: 1,
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
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    padding: '0 4px',
    fontSize: 9,
};

function withDisabledStyle(
    style: React.CSSProperties,
    isDisabled: boolean,
): React.CSSProperties {
    if (!isDisabled) return style;
    return {
        ...style,
        opacity: 0.45,
        cursor: 'not-allowed',
    };
}

function withDisabledBadgeStyle(
    style: React.CSSProperties,
    isDisabled: boolean,
): React.CSSProperties {
    if (!isDisabled) return style;
    return {
        ...style,
        background: 'var(--color-border)',
        color: '#888',
    };
}

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
    isPenAndPaper = false,
    allCellsFilled = false,
    onSubmitSolution,
}: Props) {
    const hintsUnavailable = remainingHints === 0;
    const hintDisabled = disabled || hintsUnavailable;
    const hintLabelSuffix = remainingHints === null ? '' : ` (${remainingHints} left)`;

    const isNumberBadgeDisabledSetting = useSettingsStore(
        (state) => state.disableNumberPadBadge,
    );
    // P&P mode always suppresses digit badges regardless of the setting.
    const isNumberBadgeDisabled = isPenAndPaper || isNumberBadgeDisabledSetting;

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
            {DIGITS.map((d) => {
                const digitDisabled = disabled || (remainingDigitCounts[d] === 0 && !isNumberBadgeDisabled);
                return (
                    <button
                        key={d}
                        type="button"
                        aria-label={`Place ${d} (${remainingDigitCounts[d]} left)`}
                        disabled={digitDisabled}
                        onClick={() => onDigit(d)}
                        style={withDisabledStyle(btnBase, digitDisabled)}
                    >
                        <span>{d}</span>
                        {isNumberBadgeDisabled ? null : (
                            <span aria-hidden="true" style={withDisabledBadgeStyle(digitBadge, digitDisabled)}>
                                {remainingDigitCounts[d]}
                            </span>
                        )}
                    </button>
                );
            })}

            {/* Action row */}
            <div
                style={{
                    gridColumn: '1 / -1',
                    display: 'grid',
                    gridTemplateColumns: isPenAndPaper
                        ? (allCellsFilled ? '1fr 1fr 1fr 2fr' : 'repeat(3, 1fr)')
                        : 'repeat(5, 1fr)',
                    gap: 6,
                }}
            >
                <button
                    type="button"
                    aria-label="Undo"
                    disabled={disabled}
                    onClick={onUndo}
                    style={withDisabledStyle(actionBtn, disabled)}
                >
                    Undo
                </button>

                <button
                    type="button"
                    aria-label="Erase"
                    disabled={disabled}
                    onClick={onClear}
                    style={withDisabledStyle(actionBtn, disabled)}
                >
                    Erase
                </button>

                <button
                    type="button"
                    aria-label={notesMode ? 'Notes on — click to turn off' : 'Notes off — click to turn on'}
                    aria-pressed={notesMode}
                    disabled={disabled}
                    onClick={onToggleNotes}
                    style={withDisabledStyle(
                        {
                            ...actionBtn,
                            background: notesMode ? 'var(--color-selected)' : 'var(--color-btn-bg)',
                            border: notesMode ? '2px solid var(--color-primary)' : '2px solid transparent',
                            color: notesMode ? 'var(--color-primary)' : 'var(--color-given)',
                        },
                        disabled,
                    )}
                >
                    Notes
                </button>

                {isPenAndPaper ? (
                    allCellsFilled ? (
                        <button
                            type="button"
                            aria-label="Submit solution"
                            disabled={disabled}
                            onClick={onSubmitSolution}
                            style={withDisabledStyle(
                                {
                                    ...actionBtn,
                                    background: 'var(--color-primary)',
                                    color: 'var(--color-bg)',
                                    fontWeight: '700',
                                    border: '2px solid transparent',
                                    aspectRatio: 'auto',
                                },
                                disabled,
                            )}
                        >
                            Submit
                        </button>
                    ) : null
                ) : (
                    <>
                        <button
                            type="button"
                            aria-label={`Hint — highlight the next cell to fill${hintLabelSuffix}`}
                            disabled={hintDisabled}
                            onClick={onHintSelect}
                            style={withDisabledStyle(actionBtn, hintDisabled)}
                        >
                            <span>Hint</span>
                            {remainingHints !== null && (
                                <span aria-hidden="true" style={withDisabledBadgeStyle(hintBadge, hintDisabled)}>
                                    {remainingHints}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            aria-label={`Hint+ — fill the next cell with the correct digit${hintLabelSuffix}`}
                            disabled={hintDisabled}
                            onClick={onHintApply}
                            style={withDisabledStyle(
                                {
                                    ...actionBtn,
                                    color: 'var(--color-primary)',
                                },
                                hintDisabled,
                            )}
                        >
                            <span>Hint+</span>
                            {remainingHints !== null && (
                                <span aria-hidden="true" style={withDisabledBadgeStyle(hintBadge, hintDisabled)}>
                                    {remainingHints}
                                </span>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

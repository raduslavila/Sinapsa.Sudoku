import type { CellValue, Digit } from '../engine/types.ts';

interface Props {
    index: number;
    value: CellValue;
    isGiven: boolean;
    isSelected: boolean;
    isPeer: boolean;
    isConflict: boolean;
    isWrong: boolean;
    isHinted: boolean;
    notes: ReadonlySet<Digit>;
    conflictingNotes: ReadonlySet<Digit>;
    onClick: (index: number) => void;
}

const NOTE_POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function SudokuCell({
    index,
    value,
    isGiven,
    isSelected,
    isPeer,
    isConflict,
    isWrong,
    isHinted,
    notes,
    conflictingNotes,
    onClick,
}: Props) {
    const row = Math.floor(index / 9);
    const col = index % 9;

    let bg = 'var(--color-surface)';
    if (isSelected) bg = 'var(--color-selected)';
    else if (isConflict) bg = 'var(--color-conflict)';
    else if (isPeer) bg = 'var(--color-peer)';

    let textColor = 'var(--color-given)';
    if (!isGiven) {
        if (isWrong) textColor = 'var(--color-wrong)';
        else if (isHinted) textColor = 'var(--color-hint)';
        else textColor = 'var(--color-user)';
    }

    const borderRight = col === 2 || col === 5 ? '2px solid #888' : '1px solid var(--color-border)';
    const borderBottom = row === 2 || row === 5 ? '2px solid #888' : '1px solid var(--color-border)';
    const borderLeft = col === 0 ? '2px solid #888' : undefined;
    const borderTop = row === 0 ? '2px solid #888' : undefined;
    const borderRightFinal = col === 8 ? '2px solid #888' : borderRight;
    const borderBottomFinal = row === 8 ? '2px solid #888' : borderBottom;

    return (
        <button
            type="button"
            aria-label={`Row ${row + 1}, Column ${col + 1}${value !== 0 ? `, value ${value}` : ', empty'}`}
            aria-pressed={isSelected}
            onClick={() => onClick(index)}
            style={{
                width: 'var(--cell-size)',
                height: 'var(--cell-size)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: bg,
                borderTop: borderTop ?? '1px solid var(--color-border)',
                borderLeft: borderLeft ?? '1px solid var(--color-border)',
                borderRight: borderRightFinal,
                borderBottom: borderBottomFinal,
                fontSize: value !== 0 ? 'calc(var(--cell-size) * 0.52)' : 'calc(var(--cell-size) * 0.26)',
                fontWeight: isGiven ? '700' : '400',
                color: textColor,
                position: 'relative',
                padding: 0,
                outline: isSelected
                    ? '2px solid var(--color-primary)'
                    : isHinted && value === 0
                        ? '2px solid var(--color-hint)'
                        : undefined,
                outlineOffset: '-2px',
                boxShadow: isHinted && value === 0 ? 'inset 0 0 0 2px var(--color-hint)' : undefined,
                userSelect: 'none',
                WebkitUserSelect: 'none',
            }}
        >
            {value !== 0 ? (
                <span>{value}</span>
            ) : notes.size > 0 ? (
                <span
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        width: '90%',
                        height: '90%',
                        color: 'var(--color-note)',
                        fontSize: 'calc(var(--cell-size) * 0.22)',
                        lineHeight: 1,
                    }}
                >
                    {NOTE_POSITIONS.map((d) => (
                        <span
                            key={d}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: notes.has(d) ? 1 : 0,
                                color: conflictingNotes.has(d)
                                    ? 'var(--color-wrong)'
                                    : 'var(--color-note)',
                            }}
                            aria-hidden="true"
                        >
                            {d}
                        </span>
                    ))}
                </span>
            ) : null}
        </button>
    );
}

import type { DifficultyId } from '../engine/types.ts';
import { DIFFICULTIES } from '../config/difficulties.ts';

interface Props {
    onStart: (id: DifficultyId) => void;
}

export function HomeScreen({ onStart }: Props) {
    return (
        <main
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '32px 16px',
                gap: 24,
            }}
        >
            <h1
                style={{
                    fontSize: 'clamp(28px, 8vw, 40px)',
                    fontWeight: 700,
                    letterSpacing: -1,
                    color: 'var(--color-primary)',
                }}
            >
                Sudoku
            </h1>

            <p style={{ color: '#666', fontSize: 15 }}>Choose a difficulty to start</p>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 10,
                    width: '100%',
                    maxWidth: 360,
                }}
            >
                {DIFFICULTIES.map((d) => (
                    <button
                        key={d.id}
                        type="button"
                        onClick={() => onStart(d.id)}
                        style={{
                            padding: '14px 8px',
                            borderRadius: 10,
                            background: 'var(--color-surface)',
                            border: '1.5px solid var(--color-border)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            transition: 'border-color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
                        }}
                    >
                        <span
                            style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-primary)' }}
                        >
                            {d.name}
                        </span>
                        <span style={{ fontSize: 12, color: '#888' }}>{d.description}</span>
                    </button>
                ))}
            </div>
        </main>
    );
}

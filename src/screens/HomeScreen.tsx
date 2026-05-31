import { useState } from 'react';
import { Logo } from '../assets/Logo.tsx';
import type { DifficultyId } from '../engine/types.ts';
import { DIFFICULTIES } from '../config/difficulties.ts';

interface SavedGameSummary {
    difficultyName: string;
    percentComplete: number;
    elapsedMs: number;
}

interface Props {
    onStart: (id: DifficultyId) => void;
    savedGame?: SavedGameSummary;
    onContinue?: () => void;
    onDeleteSave?: () => void;
    onStatistics?: () => void;
    onSettings?: () => void;
}

function formatElapsed(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

export function HomeScreen({ onStart, savedGame, onContinue, onDeleteSave, onStatistics, onSettings }: Props) {
    const [confirmDelete, setConfirmDelete] = useState(false);

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
            <Logo size={300} />

            {/* Continue Game card */}
            {savedGame && (
                <div
                    style={{
                        width: '100%',
                        maxWidth: 360,
                        background: 'var(--color-surface)',
                        border: '1.5px solid var(--color-primary)',
                        borderRadius: 12,
                        overflow: 'hidden',
                    }}
                >
                    {!confirmDelete ? (
                        <div style={{ display: 'flex', alignItems: 'stretch' }}>
                            {/* Continue button */}
                            <button
                                type="button"
                                onClick={onContinue}
                                style={{
                                    flex: 1,
                                    padding: '14px 16px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                }}
                            >
                                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-primary)' }}>
                                    Continue Game
                                </span>
                                <span style={{ fontSize: 13, color: '#666' }}>
                                    {savedGame.difficultyName}
                                    &ensp;·&ensp;
                                    {savedGame.percentComplete}% complete
                                    &ensp;·&ensp;
                                    {formatElapsed(savedGame.elapsedMs)}
                                </span>
                            </button>

                            {/* Delete button */}
                            <button
                                type="button"
                                aria-label="Delete saved game"
                                onClick={() => setConfirmDelete(true)}
                                style={{
                                    padding: '0 14px',
                                    background: 'none',
                                    border: 'none',
                                    borderLeft: '1px solid var(--color-border)',
                                    cursor: 'pointer',
                                    fontSize: 18,
                                    color: '#999',
                                    lineHeight: 1,
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-wrong)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#999'; }}
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        /* Inline confirmation */
                        <div
                            style={{
                                padding: '14px 16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                            }}
                        >
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-given)' }}>
                                Delete saved game?
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmDelete(false);
                                        onDeleteSave?.();
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        borderRadius: 8,
                                        border: '1.5px solid var(--color-wrong)',
                                        background: 'none',
                                        color: 'var(--color-wrong)',
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Yes, delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(false)}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        borderRadius: 8,
                                        border: '1.5px solid var(--color-border)',
                                        background: 'none',
                                        color: 'var(--color-given)',
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                    }}
                                >
                                    No, keep it
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

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

            {/* Secondary nav */}
            <div style={{ display: 'flex', gap: 12 }}>
                {onStatistics && (
                    <button
                        type="button"
                        onClick={onStatistics}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 8,
                            background: 'var(--color-btn-bg)',
                            border: 'none',
                            color: 'var(--color-given)',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Statistics
                    </button>
                )}
                {onSettings && (
                    <button
                        type="button"
                        onClick={onSettings}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 8,
                            background: 'var(--color-btn-bg)',
                            border: 'none',
                            color: 'var(--color-given)',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Settings
                    </button>
                )}
            </div>
        </main>
    );
}

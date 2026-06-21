import { useState } from 'react';
import { Logo } from '../assets/Logo.tsx';
import type { DifficultyId, GameMode } from '../engine/types.ts';
import { DIFFICULTIES } from '../config/difficulties.ts';

interface SavedGameSummary {
    difficultyName: string;
    percentComplete: number;
    elapsedMs: number;
    gameMode?: 'classic' | 'pen-and-paper';
}

interface Props {
    onStart: (id: DifficultyId, gameMode?: GameMode) => void;
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
    const [penAndPaperDifficulty, setPenAndPaperDifficulty] = useState<DifficultyId>(1);

    return (
        <main
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '2dvh 2dvh',
                gap: '2dvh',
            }}
        >
            <Logo height="10dvh" />

            {/* Continue Game card */}
            {
                savedGame && (
                    <div
                        style={{
                            width: '100%',
                            background: 'var(--color-surface)',
                            border: '1.5px solid var(--color-primary)',
                            borderRadius: '2dvh',
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
                                        padding: '2dvh 2dvh',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5dvh',
                                    }}
                                >
                                    <span style={{ fontWeight: 700, fontSize: '2dvh', color: 'var(--color-primary)' }}>
                                        Continue Game
                                        {savedGame.gameMode === 'pen-and-paper' && (
                                            <span style={{ marginLeft: 8, fontSize: '1.5dvh', fontWeight: 600, color: 'var(--color-given)', background: 'var(--color-btn-bg)', borderRadius: 4, padding: '2px 6px', verticalAlign: 'center' }}>
                                                Pen &amp; Paper
                                            </span>
                                        )}
                                    </span>
                                    <span style={{ fontSize: '1.5dvh', color: '#666' }}>
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
                                        padding: '0 2dvh',
                                        background: 'none',
                                        border: 'none',
                                        borderLeft: '1px solid var(--color-border)',
                                        cursor: 'pointer',
                                        fontSize: '2dvh',
                                        color: '#999',
                                        lineHeight: '1dvh',
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
                                    padding: '2dvh 2dvh',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <span style={{ fontSize: '2dvh', fontWeight: 600, color: 'var(--color-given)' }}>
                                    Delete saved game?
                                </span>
                                <div style={{ display: 'flex', gap: '2dvh' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setConfirmDelete(false);
                                            onDeleteSave?.();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '1dvh',
                                            borderRadius: '1dvh',
                                            border: '1.5px solid var(--color-wrong)',
                                            background: 'none',
                                            color: 'var(--color-wrong)',
                                            fontWeight: 600,
                                            fontSize: '1.5dvh',
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
                                            padding: '1dvh',
                                            borderRadius: '1dvh',
                                            border: '1.5px solid var(--color-border)',
                                            background: 'none',
                                            color: 'var(--color-given)',
                                            fontWeight: 600,
                                            fontSize: '1.5dvh',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        No, keep it
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

            {/* <p style={{ color: '#666', fontSize: 15 }}>Choose a difficulty to start</p> */}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1dvh',
                    width: '100%',
                    objectFit: 'scale-down',
                }}
            >
                {DIFFICULTIES.map((d) => (
                    <button
                        key={d.id}
                        type="button"
                        onClick={() => onStart(d.id)}
                        style={{
                            padding: '1dvh 1dvh',
                            borderRadius: '1dvh',
                            background: 'var(--color-surface)',
                            border: '1.5px solid var(--color-border)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1dvh',
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
                            style={{ fontWeight: 600, fontSize: '2dvh', color: 'var(--color-primary)' }}
                        >
                            {d.name}
                        </span>
                        <span style={{ fontSize: '1.5dvh', color: '#888' }}>{d.description}</span>
                    </button>
                ))}
            </div>

            {/* Pen & Paper mode */}
            <div
                style={{
                    width: '100%',
                    background: 'var(--color-surface)',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: '2dvh',
                    padding: '2dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1dvh',
                }}
            >
                <div>
                    <p style={{ fontWeight: 700, fontSize: '2dvh', color: 'var(--color-primary)', margin: 0 }}>
                        Pen &amp; Paper
                    </p>
                    <p style={{ fontSize: '1.5dvh', color: '#888', margin: '4px 0 0' }}>
                        Sudoku like you would play it on paper — no hints, no highlights, no badge counters.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1dvh' }}>
                    <select
                        aria-label="Pen & Paper difficulty"
                        value={penAndPaperDifficulty}
                        onChange={(e) => setPenAndPaperDifficulty(Number(e.target.value) as DifficultyId)}
                        style={{
                            flex: 1,
                            padding: '1dvh',
                            borderRadius: '1dvh',
                            border: '1.5px solid var(--color-border)',
                            background: 'var(--color-bg)',
                            color: 'var(--color-primary)',
                            fontSize: '2dvh',
                            fontWeight: 500,
                        }}
                    >
                        {DIFFICULTIES.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => onStart(penAndPaperDifficulty, 'pen-and-paper')}
                        style={{
                            padding: '1dvh 2dvh',
                            borderRadius: '1dvh',
                            background: 'var(--color-bg)',
                            border: '1.5px solid var(--color-border)',
                            color: 'var(--color-primary)',
                            fontSize: '2dvh',
                            fontWeight: 700,
                            cursor: 'pointer',
                            flexShrink: 0,
                        }}
                    >
                        Start
                    </button>
                </div>
            </div>

            {/* Secondary nav */}
            <div style={{ display: 'flex', gap: '1dvh' }}>
                {onStatistics && (
                    <button
                        type="button"
                        onClick={onStatistics}
                        style={{
                            padding: '1dvh 2dvh',
                            borderRadius: '1dvh',
                            background: 'var(--color-btn-bg)',
                            border: 'none',
                            color: 'var(--color-given)',
                            fontSize: '2dvh',
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
                            padding: '1dvh 2dvh',
                            borderRadius: '1dvh',
                            background: 'var(--color-btn-bg)',
                            border: 'none',
                            color: 'var(--color-given)',
                            fontSize: '2dvh',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Settings
                    </button>
                )}
            </div>
        </main >
    );
}

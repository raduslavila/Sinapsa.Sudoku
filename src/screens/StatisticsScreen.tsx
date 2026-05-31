import { useEffect, useState } from 'react';
import { clearCompletedGames, loadCompletedGames } from '../storage/index.ts';
import { computeStatistics } from '../state/statistics.ts';
import type { Statistics } from '../state/statistics.ts';
import { DIFFICULTIES } from '../config/difficulties.ts';
import type { DifficultyId } from '../engine/types.ts';

interface Props {
    onBack: () => void;
}

function formatTime(ms: number | null): string {
    if (ms === null) return '—';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

export function StatisticsScreen({ onBack }: Props) {
    const [stats, setStats] = useState<Statistics | null>(null);
    const [confirmClear, setConfirmClear] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const refreshStatistics = () => {
        loadCompletedGames()
            .then((games) => setStats(computeStatistics(games)))
            .catch(() => setStats(computeStatistics([])));
    };

    useEffect(() => {
        refreshStatistics();
    }, []);

    const handleClearStatistics = () => {
        setIsClearing(true);
        clearCompletedGames()
            .then(() => {
                setConfirmClear(false);
                setStats(computeStatistics([]));
            })
            .finally(() => setIsClearing(false));
    };

    const totalWinRate =
        stats && stats.totalPlayed > 0
            ? Math.round((stats.totalWon / stats.totalPlayed) * 100)
            : null;

    return (
        <main
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 16px 32px',
                gap: 24,
                overflowY: 'auto',
            }}
        >
            {/* Header */}
            <div
                style={{
                    width: '100%',
                    maxWidth: 400,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}
            >
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Back"
                    style={{
                        fontSize: 14,
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        padding: '4px 8px',
                    }}
                >
                    ← Back
                </button>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-given)' }}>
                    Statistics
                </h2>
            </div>

            {stats === null ? (
                <p style={{ color: '#888', fontSize: 14 }}>Loading…</p>
            ) : stats.totalPlayed === 0 ? (
                <p style={{ color: '#888', fontSize: 14 }}>No games completed yet. Start playing!</p>
            ) : (
                <>
                    {/* Summary cards */}
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 400,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 10,
                        }}
                    >
                        {[
                            { label: 'Played', value: String(stats.totalPlayed) },
                            { label: 'Won', value: String(stats.totalWon) },
                            { label: 'Win rate', value: totalWinRate !== null ? `${totalWinRate}%` : '—' },
                        ].map((card) => (
                            <div
                                key={card.label}
                                style={{
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 10,
                                    padding: '12px 8px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                }}
                            >
                                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
                                    {card.value}
                                </span>
                                <span style={{ fontSize: 12, color: '#888' }}>{card.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Per-difficulty breakdown */}
                    <section style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-given)' }}>
                            By difficulty
                        </h3>

                        {/* Column headers */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 48px 48px 72px 72px',
                                gap: 6,
                                padding: '0 8px',
                            }}
                        >
                            {['Difficulty', 'Played', 'Won', 'Best', 'Avg'].map((h) => (
                                <span key={h} style={{ fontSize: 11, color: '#888', textAlign: 'center' }}>
                                    {h}
                                </span>
                            ))}
                        </div>

                        {DIFFICULTIES.map((d) => {
                            const row = stats.byDifficulty[d.id as DifficultyId];
                            if (!row) return null;
                            return (
                                <div
                                    key={d.id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 48px 48px 72px 72px',
                                        gap: 6,
                                        alignItems: 'center',
                                        padding: '10px 8px',
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 8,
                                    }}
                                >
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-given)' }}>
                                        {d.name}
                                    </span>
                                    <span style={{ fontSize: 13, textAlign: 'center', color: 'var(--color-given)' }}>
                                        {row.played}
                                    </span>
                                    <span style={{ fontSize: 13, textAlign: 'center', color: 'var(--color-hint)' }}>
                                        {row.won}
                                    </span>
                                    <span style={{ fontSize: 12, textAlign: 'center', color: 'var(--color-given)' }}>
                                        {formatTime(row.bestTimeMs)}
                                    </span>
                                    <span style={{ fontSize: 12, textAlign: 'center', color: '#888' }}>
                                        {formatTime(row.avgTimeMs)}
                                    </span>
                                </div>
                            );
                        })}

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                paddingTop: 4,
                            }}
                        >
                            {!confirmClear ? (
                                <button
                                    type="button"
                                    onClick={() => setConfirmClear(true)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-wrong)',
                                        fontSize: 13,
                                        fontWeight: 600,
                                    }}
                                >
                                    Clear Statistics
                                </button>
                            ) : (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                        color: 'var(--color-given)',
                                        fontSize: 13,
                                    }}
                                >
                                    <span style={{ color: '#888' }}>
                                        This cannot be undone. Clear all statistics?
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleClearStatistics}
                                        disabled={isClearing}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: 8,
                                            background: 'var(--color-wrong)',
                                            color: '#fff',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            opacity: isClearing ? 0.6 : 1,
                                        }}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmClear(false)}
                                        disabled={isClearing}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: 8,
                                            background: 'var(--color-surface)',
                                            border: '1px solid var(--color-border)',
                                            color: 'var(--color-given)',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            opacity: isClearing ? 0.6 : 1,
                                        }}
                                    >
                                        No
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

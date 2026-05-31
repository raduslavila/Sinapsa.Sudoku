import { useEffect, useState } from 'react';
import type { GameStatus } from '../state/gameState.ts';
import { getElapsedMs } from '../state/gameState.ts';
import type { GameState } from '../state/gameState.ts';

interface Props {
    game: GameState;
    status: GameStatus;
}

function formatMs(ms: number): string {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Timer({ game, status }: Props) {
    const [display, setDisplay] = useState(() => formatMs(getElapsedMs(game, Date.now())));

    useEffect(() => {
        // Always refresh once when deps change (e.g. pause/resume)
        // We do this inside a rAF to avoid synchronous setState in effect body.
        const rafId = requestAnimationFrame(() => {
            setDisplay(formatMs(getElapsedMs(game, Date.now())));
        });

        if (status !== 'playing') {
            return () => cancelAnimationFrame(rafId);
        }

        const id = setInterval(() => {
            setDisplay(formatMs(getElapsedMs(game, Date.now())));
        }, 500);

        return () => {
            cancelAnimationFrame(rafId);
            clearInterval(id);
        };
    }, [game, status]);

    return (
        <time
            aria-label={`Elapsed time ${display}`}
            style={{
                fontVariantNumeric: 'tabular-nums',
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 1,
                color: 'var(--color-given)',
            }}
        >
            {display}
        </time>
    );
}

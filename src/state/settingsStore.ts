import { create } from 'zustand';
import type { DifficultyId } from '../engine/types.ts';
import { CURRENT_SCHEMA_VERSION } from '../storage/types.ts';
import { loadSettings, saveSettings } from '../storage/index.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = 'light' | 'dark' | 'system';

export interface SettingsState {
    readonly theme: Theme;
    /** Per-difficulty mistake limit. undefined key = use difficulty default. null = unlimited. */
    readonly mistakeLimitOverrides: Partial<Record<DifficultyId, number | null>>;
    /** Per-difficulty hint limit per game. undefined key = unlimited. null = unlimited. */
    readonly hintLimitOverrides: Partial<Record<DifficultyId, number | null>>;
}

interface SettingsStore extends SettingsState {
    /** Load settings from IndexedDB. Call once on app mount. */
    init: () => Promise<void>;
    setTheme: (theme: Theme) => void;
    /** Set mistake limit for a difficulty. Pass undefined to reset to default. */
    setMistakeLimit: (difficultyId: DifficultyId, limit: number | null | undefined) => void;
    /** Set hint limit for a difficulty. Pass undefined to reset to unlimited. */
    setHintLimit: (difficultyId: DifficultyId, limit: number | null | undefined) => void;
}

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------

const DEFAULT_STATE: SettingsState = {
    theme: 'system',
    mistakeLimitOverrides: {},
    hintLimitOverrides: {},
};

// ---------------------------------------------------------------------------
// DOM theme application
// ---------------------------------------------------------------------------

function applyThemeToDOM(theme: Theme): void {
    if (typeof document === 'undefined') return; // SSR / test guard
    if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.dataset.theme = theme;
    }
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function persist(state: SettingsState): void {
    const record = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: Date.now(),
        theme: state.theme,
        mistakeLimitOverrides: Object.fromEntries(
            Object.entries(state.mistakeLimitOverrides).map(([k, v]) => [k, v ?? null])
        ) as Record<string, number | null>,
        hintLimitOverrides: Object.fromEntries(
            Object.entries(state.hintLimitOverrides).map(([k, v]) => [k, v ?? null])
        ) as Record<string, number | null>,
    };
    void saveSettings(record);
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    ...DEFAULT_STATE,

    init: async () => {
        const saved = await loadSettings();
        if (!saved) return;

        const mistakeLimitOverrides: Partial<Record<DifficultyId, number | null>> = {};
        for (const [k, v] of Object.entries(saved.mistakeLimitOverrides)) {
            const id = Number(k) as DifficultyId;
            mistakeLimitOverrides[id] = v;
        }

        const hintLimitOverrides: Partial<Record<DifficultyId, number | null>> = {};
        for (const [k, v] of Object.entries(saved.hintLimitOverrides)) {
            const id = Number(k) as DifficultyId;
            hintLimitOverrides[id] = v;
        }

        const theme = saved.theme;
        applyThemeToDOM(theme);
        set({ theme, mistakeLimitOverrides, hintLimitOverrides });
    },

    setTheme: (theme) => {
        applyThemeToDOM(theme);
        set({ theme });
        persist({ ...get(), theme });
    },

    setMistakeLimit: (difficultyId, limit) => {
        const next = { ...get().mistakeLimitOverrides };
        if (limit === undefined) {
            delete next[difficultyId];
        } else {
            next[difficultyId] = limit;
        }
        set({ mistakeLimitOverrides: next });
        persist({ ...get(), mistakeLimitOverrides: next });
    },

    setHintLimit: (difficultyId, limit) => {
        const next = { ...get().hintLimitOverrides };
        if (limit === undefined) {
            delete next[difficultyId];
        } else {
            next[difficultyId] = limit;
        }
        set({ hintLimitOverrides: next });
        persist({ ...get(), hintLimitOverrides: next });
    },
}));

// ---------------------------------------------------------------------------
// Utility selectors
// ---------------------------------------------------------------------------

/** Returns the effective mistake limit for a difficulty, respecting overrides. */
export function effectiveMistakeLimit(
    overrides: Partial<Record<DifficultyId, number | null>>,
    difficultyId: DifficultyId,
    defaultLimit: number | null,
): number | null {
    return difficultyId in overrides ? (overrides[difficultyId] ?? null) : defaultLimit;
}

/** Returns the effective hint limit for a difficulty. null = unlimited. */
export function effectiveHintLimit(
    overrides: Partial<Record<DifficultyId, number | null>>,
    difficultyId: DifficultyId,
): number | null {
    return overrides[difficultyId] ?? null;
}

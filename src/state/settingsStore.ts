import { create } from 'zustand';
import type { DifficultyId } from '../engine/types.ts';
import { CURRENT_SCHEMA_VERSION } from '../storage/types.ts';
import { loadSettings, saveSettings } from '../storage/index.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = 'light' | 'dark' | 'system';

export type PaletteId =
    | 'electric-blue'
    | 'midnight-purple'
    | 'forest-green'
    | 'sunset-orange'
    | 'rose-gold'
    | 'obsidian'
    | 'arctic';

export interface PaletteEntry {
    readonly id: PaletteId;
    readonly label: string;
    readonly lightPrimary: string;
    readonly accent: string;
}

export const PALETTES: readonly PaletteEntry[] = [
    { id: 'electric-blue', label: 'Electric Blue', lightPrimary: '#1a6fc4', accent: '#4dd8ff' },
    { id: 'midnight-purple', label: 'Midnight Purple', lightPrimary: '#7c3aed', accent: '#c084fc' },
    { id: 'forest-green', label: 'Forest Green', lightPrimary: '#16a34a', accent: '#86efac' },
    { id: 'sunset-orange', label: 'Sunset Orange', lightPrimary: '#ea6c00', accent: '#fbbf24' },
    { id: 'rose-gold', label: 'Rose Gold', lightPrimary: '#db2777', accent: '#fb7185' },
    { id: 'obsidian', label: 'Obsidian', lightPrimary: '#374151', accent: '#9ca3af' },
    { id: 'arctic', label: 'Arctic', lightPrimary: '#0891b2', accent: '#67e8f9' },
];

export interface SettingsState {
    readonly theme: Theme;
    readonly palette: PaletteId;
    /** Per-difficulty mistake limit. undefined key = use difficulty default. null = unlimited. */
    readonly mistakeLimitOverrides: Partial<Record<DifficultyId, number | null>>;
    /** Per-difficulty hint limit per game. undefined key = unlimited. null = unlimited. */
    readonly hintLimitOverrides: Partial<Record<DifficultyId, number | null>>;
    /** Developer-only: highlight note digits that conflict with placed values. */
    readonly showWrongNoteConflicts: boolean;
    /** One-time gate for native in-app review prompt. */
    readonly ratingPromptShown: boolean;
    /** Disable number pad badge and functionality. */
    readonly disableNumberPadBadge: boolean;
}

interface SettingsStore extends SettingsState {
    /** Load settings from IndexedDB. Call once on app mount. */
    init: () => Promise<void>;
    setTheme: (theme: Theme) => void;
    setPalette: (palette: PaletteId) => void;
    /** Set mistake limit for a difficulty. Pass undefined to reset to default. */
    setMistakeLimit: (difficultyId: DifficultyId, limit: number | null | undefined) => void;
    /** Set hint limit for a difficulty. Pass undefined to reset to unlimited. */
    setHintLimit: (difficultyId: DifficultyId, limit: number | null | undefined) => void;
    setShowWrongNoteConflicts: (enabled: boolean) => void;
    setDisableNumberPadBadge: (enabled: boolean) => void;
    setRatingPromptShown: (shown: boolean) => void;
}

export const DEV_SETTINGS_ENABLED = import.meta.env.DEV;

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------

const DEFAULT_STATE: SettingsState = {
    theme: 'system',
    palette: 'electric-blue',
    mistakeLimitOverrides: {},
    hintLimitOverrides: {},
    showWrongNoteConflicts: false,
    disableNumberPadBadge: false,
    ratingPromptShown: false,
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

function applyPaletteToDOM(palette: PaletteId): void {
    if (typeof document === 'undefined') return; // SSR / test guard
    document.documentElement.dataset.palette = palette;
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function persist(state: SettingsState): void {
    const record = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: Date.now(),
        theme: state.theme,
        palette: state.palette,
        mistakeLimitOverrides: Object.fromEntries(
            Object.entries(state.mistakeLimitOverrides).map(([k, v]) => [k, v ?? null])
        ) as Record<string, number | null>,
        hintLimitOverrides: Object.fromEntries(
            Object.entries(state.hintLimitOverrides).map(([k, v]) => [k, v ?? null])
        ) as Record<string, number | null>,
        showWrongNoteConflicts: state.showWrongNoteConflicts,
        disableNumberPadBadge: state.disableNumberPadBadge,
        ratingPromptShown: state.ratingPromptShown,
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
        const palette = (saved.palette as PaletteId | undefined) ?? 'electric-blue';
        const showWrongNoteConflicts = saved.showWrongNoteConflicts ?? false;
        const disableNumberPadBadge = saved.disableNumberPadBadge ?? false;
        const ratingPromptShown = saved.ratingPromptShown ?? false;
        applyThemeToDOM(theme);
        applyPaletteToDOM(palette);
        set({
            theme,
            palette,
            mistakeLimitOverrides,
            hintLimitOverrides,
            showWrongNoteConflicts,
            disableNumberPadBadge,
            ratingPromptShown,
        });
    },

    setTheme: (theme) => {
        applyThemeToDOM(theme);
        set({ theme });
        persist({ ...get(), theme });
    },

    setPalette: (palette) => {
        applyPaletteToDOM(palette);
        set({ palette });
        persist({ ...get(), palette });
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

    setShowWrongNoteConflicts: (enabled) => {
        set({ showWrongNoteConflicts: enabled });
        persist({ ...get(), showWrongNoteConflicts: enabled });
    },

    setRatingPromptShown: (shown) => {
        set({ ratingPromptShown: shown });
        persist({ ...get(), ratingPromptShown: shown });
    },

    setDisableNumberPadBadge: (enabled) => {
        set({ disableNumberPadBadge: enabled });
        persist({ ...get(), disableNumberPadBadge: enabled });
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
    defaultLimit: number | null,
): number | null {
    return difficultyId in overrides ? (overrides[difficultyId] ?? null) : defaultLimit;
}

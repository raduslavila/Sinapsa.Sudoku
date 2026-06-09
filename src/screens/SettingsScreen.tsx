import { DEV_SETTINGS_ENABLED, useSettingsStore } from '../state/settingsStore.ts';
import type { Theme, PaletteId, PaletteEntry } from '../state/settingsStore.ts';
import { PALETTES } from '../state/settingsStore.ts';
import { DIFFICULTIES } from '../config/difficulties.ts';
import type { DifficultyId } from '../engine/types.ts';

interface Props {
    onBack: () => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PaletteSwatch({
    entry,
    current,
    onSelect,
}: {
    entry: PaletteEntry;
    current: PaletteId;
    onSelect: (id: PaletteId) => void;
}) {
    const active = entry.id === current;
    return (
        <button
            type="button"
            onClick={() => onSelect(entry.id)}
            aria-label={entry.label}
            aria-pressed={active}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                padding: '6px 2px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                flex: 1,
            }}
        >
            <div
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: entry.lightPrimary,
                    outline: active ? `3px solid ${entry.lightPrimary}` : '3px solid transparent',
                    outlineOffset: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.12)',
                    transition: 'outline 0.15s, box-shadow 0.15s',
                }}
            >
                <div
                    style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: entry.accent,
                        border: '2px solid rgba(255,255,255,0.7)',
                    }}
                />
            </div>
            <span
                style={{
                    fontSize: 9,
                    color: 'var(--color-given)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    fontWeight: active ? 700 : 400,
                    opacity: active ? 1 : 0.7,
                    maxWidth: 44,
                    wordBreak: 'break-word',
                }}
            >
                {entry.label}
            </span>
        </button>
    );
}

function ThemeButton({
    label,
    value,
    current,
    onSelect,
}: {
    label: string;
    value: Theme;
    current: Theme;
    onSelect: (t: Theme) => void;
}) {
    const active = value === current;
    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                color: active ? '#fff' : 'var(--color-given)',
                fontWeight: active ? 700 : 400,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s',
            }}
        >
            {label}
        </button>
    );
}

function LimitInput({
    value,
    defaultValue,
    minimumValue,
    onChange,
    placeholder,
}: {
    value: number | null | undefined;
    defaultValue: number | null;
    minimumValue: number;
    onChange: (v: number | null | undefined) => void;
    placeholder: string;
}) {
    // undefined = use default, null = unlimited override, number = custom value
    const isDefault = value === undefined;
    const displayValue = isDefault
        ? (defaultValue === null ? '' : String(defaultValue))
        : (value === null ? '' : String(value));

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
                type="number"
                min={minimumValue}
                max={99}
                value={displayValue}
                placeholder={placeholder}
                onChange={(e) => {
                    const raw = e.target.value.trim();
                    if (raw === '') {
                        onChange(null); // unlimited override
                    } else {
                        const n = parseInt(raw, 10);
                        if (!isNaN(n) && n >= minimumValue) onChange(n);
                    }
                }}
                style={{
                    width: 52,
                    padding: '4px 6px',
                    borderRadius: 6,
                    border: `1px solid ${isDefault ? 'var(--color-border)' : 'var(--color-primary)'}`,
                    background: 'var(--color-surface)',
                    color: 'var(--color-given)',
                    fontSize: 13,
                    textAlign: 'center',
                }}
            />
            {!isDefault && (
                <button
                    type="button"
                    title="Reset to default"
                    onClick={() => onChange(undefined)}
                    style={{
                        fontSize: 12,
                        color: '#888',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        border: 'none',
                        background: 'none',
                    }}
                >
                    ↩
                </button>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export function SettingsScreen({ onBack }: Props) {
    const theme = useSettingsStore((s) => s.theme);
    const palette = useSettingsStore((s) => s.palette);
    const mistakeLimitOverrides = useSettingsStore((s) => s.mistakeLimitOverrides);
    const hintLimitOverrides = useSettingsStore((s) => s.hintLimitOverrides);
    const showWrongNoteConflicts = useSettingsStore((s) => s.showWrongNoteConflicts);
    const setTheme = useSettingsStore((s) => s.setTheme);
    const setPalette = useSettingsStore((s) => s.setPalette);
    const setMistakeLimit = useSettingsStore((s) => s.setMistakeLimit);
    const setHintLimit = useSettingsStore((s) => s.setHintLimit);
    const setShowWrongNoteConflicts = useSettingsStore((s) => s.setShowWrongNoteConflicts);

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
                    Settings
                </h2>
            </div>

            {/* Color Palette */}
            <section style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-given)' }}>Color Palette</h3>
                <div style={{ display: 'flex', gap: 2 }}>
                    {PALETTES.map((entry) => (
                        <PaletteSwatch
                            key={entry.id}
                            entry={entry}
                            current={palette}
                            onSelect={setPalette}
                        />
                    ))}
                </div>
            </section>

            {/* Theme */}
            <section style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-given)' }}>Theme</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    <ThemeButton label="Light" value="light" current={theme} onSelect={setTheme} />
                    <ThemeButton label="Dark" value="dark" current={theme} onSelect={setTheme} />
                    <ThemeButton label="System" value="system" current={theme} onSelect={setTheme} />
                </div>
            </section>

            {/* Limits table */}
            <section style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-given)' }}>
                    Limits per difficulty
                </h3>
                <p style={{ fontSize: 12, color: '#888' }}>
                    Mistakes: max wrong placements per game (empty = unlimited).
                    Hints: max hints per game (empty = unlimited).
                </p>

                {/* Column headers */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 80px 80px',
                        gap: 8,
                        padding: '0 4px',
                    }}
                >
                    <span style={{ fontSize: 12, color: '#888' }}>Difficulty</span>
                    <span style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>Mistakes</span>
                    <span style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>Hints</span>
                </div>

                {DIFFICULTIES.map((d) => {
                    const mistakeVal = mistakeLimitOverrides[d.id as DifficultyId];
                    const hintVal = hintLimitOverrides[d.id as DifficultyId];
                    return (
                        <div
                            key={d.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 80px 80px',
                                gap: 8,
                                alignItems: 'center',
                                padding: '8px',
                                background: 'var(--color-surface)',
                                borderRadius: 8,
                                border: '1px solid var(--color-border)',
                            }}
                        >
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-given)' }}>
                                {d.name}
                            </span>
                            <LimitInput
                                value={mistakeVal}
                                defaultValue={d.defaultMistakeLimit}
                                minimumValue={1}
                                onChange={(v) => setMistakeLimit(d.id as DifficultyId, v)}
                                placeholder={d.defaultMistakeLimit === null ? '∞' : String(d.defaultMistakeLimit)}
                            />
                            <LimitInput
                                value={hintVal}
                                defaultValue={d.defaultHintLimit}
                                minimumValue={0}
                                onChange={(v) => setHintLimit(d.id as DifficultyId, v)}
                                placeholder={d.defaultHintLimit === null ? '∞' : String(d.defaultHintLimit)}
                            />
                        </div>
                    );
                })}
            </section>

            {DEV_SETTINGS_ENABLED && (
                <section style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-given)' }}>
                        Advanced options
                    </h3>
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            padding: '12px 14px',
                            background: 'var(--color-surface)',
                            borderRadius: 10,
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-given)',
                        }}
                    >
                        <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Highlight wrong notes</span>
                            <span style={{ fontSize: 12, color: '#888' }}>
                                Colors note digits red when they conflict with placed values.
                            </span>
                        </span>
                        <input
                            type="checkbox"
                            checked={showWrongNoteConflicts}
                            onChange={(e) => setShowWrongNoteConflicts(e.target.checked)}
                            aria-label="Highlight wrong notes"
                        />
                    </label>
                </section>
            )}
        </main>
    );
}

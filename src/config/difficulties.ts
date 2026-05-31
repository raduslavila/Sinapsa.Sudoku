import type { DifficultyId } from '../engine/types.ts';

export interface DifficultyConfig {
    readonly id: DifficultyId;
    readonly name: string;
    /** null = unlimited */
    readonly defaultMistakeLimit: number | null;
    /** null = unlimited */
    readonly defaultHintLimit: number | null;
    readonly minGivens: number;
    readonly maxGivens: number;
    readonly description: string;
}

export const DIFFICULTIES: readonly DifficultyConfig[] = [
    { id: 1, name: 'Beginner', defaultMistakeLimit: null, defaultHintLimit: 10, minGivens: 46, maxGivens: 54, description: 'Perfect for learning' },
    { id: 2, name: 'Easy', defaultMistakeLimit: 5, defaultHintLimit: 6, minGivens: 40, maxGivens: 46, description: 'Straightforward puzzles' },
    { id: 3, name: 'Casual', defaultMistakeLimit: 5, defaultHintLimit: 5, minGivens: 36, maxGivens: 40, description: 'A gentle challenge' },
    { id: 4, name: 'Normal', defaultMistakeLimit: 4, defaultHintLimit: 3, minGivens: 32, maxGivens: 36, description: 'Classic Sudoku' },
    { id: 5, name: 'Medium', defaultMistakeLimit: 4, defaultHintLimit: 3, minGivens: 28, maxGivens: 32, description: 'Requires some thought' },
    { id: 6, name: 'Tricky', defaultMistakeLimit: 3, defaultHintLimit: 2, minGivens: 26, maxGivens: 29, description: 'Tests your skills' },
    { id: 7, name: 'Hard', defaultMistakeLimit: 3, defaultHintLimit: 2, minGivens: 24, maxGivens: 27, description: 'For serious solvers' },
    { id: 8, name: 'Expert', defaultMistakeLimit: 3, defaultHintLimit: 1, minGivens: 22, maxGivens: 25, description: 'Advanced techniques needed' },
    { id: 9, name: 'Master', defaultMistakeLimit: 2, defaultHintLimit: 1, minGivens: 21, maxGivens: 24, description: 'Near the limit' },
    { id: 10, name: 'Nightmare', defaultMistakeLimit: 1, defaultHintLimit: 0, minGivens: 17, maxGivens: 22, description: 'For the brave' },
] satisfies DifficultyConfig[];

export function getDifficultyConfig(id: DifficultyId): DifficultyConfig {
    const config = DIFFICULTIES.find((d) => d.id === id);
    if (config === undefined) throw new Error(`getDifficultyConfig: unknown difficulty ID ${id}`);
    return config;
}

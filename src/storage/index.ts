export {
    saveActiveGame,
    loadActiveGame,
    deleteActiveGame,
    saveCompletedGame,
    loadCompletedGames,
    clearCompletedGames,
    loadSettings,
    saveSettings,
    clearAllData,
} from './indexedDbRepository.ts';

export type { PersistedGame, PersistedCompletedGame, PersistedSettings } from './types.ts';

export {
    saveActiveGame,
    loadActiveGame,
    deleteActiveGame,
    saveCompletedGame,
    loadCompletedGames,
    clearAllData,
} from './indexedDbRepository.ts';

export type { PersistedGame, PersistedCompletedGame } from './types.ts';

import type { IDBPDatabase } from 'idb';
import { CURRENT_SCHEMA_VERSION } from './types.ts';

/** DB name and current version for IndexedDB. */
export const DB_NAME = 'sinapsa-sudoku';
export const DB_VERSION = 2;

/**
 * Called by openDatabase's `upgrade` callback.
 * Apply migrations in version order — never mutate existing migrations.
 */
export function applyMigrations(db: IDBPDatabase, oldVersion: number): void {
    if (oldVersion < 1) {
        // v1: initial schema
        db.createObjectStore('activeGame');         // key = 'active' (singleton)
        db.createObjectStore('completedGames');     // key = game id (nanoid)
    }
    if (oldVersion < 2) {
        // v2: add settings store
        db.createObjectStore('settings');           // key = 'global' (singleton)
    }
}

/** Minimum schema version we can safely read without migration. */
export const MIN_READABLE_SCHEMA_VERSION = 1;

/**
 * Returns whether a stored record's schemaVersion is compatible.
 * Rejects records that were written by a future version we don't understand.
 */
export function isCompatibleSchemaVersion(version: number): boolean {
    return version >= MIN_READABLE_SCHEMA_VERSION && version <= CURRENT_SCHEMA_VERSION;
}

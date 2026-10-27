import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// enableChangeListener es obligatorio para que useLiveQuery se actualice solo.
const sqlite = openDatabaseSync('mitienda.db', { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as authSchema from './schema/auth';
import * as projectsSchema from './schema/projects';
import * as aiToolsSchema from './schema/ai-tools';
import * as filesSchema from './schema/files';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/codeguide_ai_assistant',
});

export const db = drizzle(pool, {
  schema: {
    ...authSchema,
    ...projectsSchema,
    ...aiToolsSchema,
    ...filesSchema,
  },
});
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth';
import * as projectsSchema from './schema/projects';
import * as aiToolsSchema from './schema/ai-tools';
import * as filesSchema from './schema/files';

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    ...authSchema,
    ...projectsSchema,
    ...aiToolsSchema,
    ...filesSchema,
  },
});
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',

  dbCredentials: {
    url: "_munbun_/data.db"
  },

  verbose: true,
  strict: true,
  dialect: 'sqlite',
  migrations: {
    table: '_migrations_'
  },
});

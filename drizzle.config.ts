import { type Config } from "drizzle-kit";


export default {
  schema: "./src/server/db/schema.ts",
	out: './db/migrations',
  driver: "better-sqlite",
  dbCredentials:{
    url: './db/sqlite.db'
  }
} satisfies Config;

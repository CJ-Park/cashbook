import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "dotenv";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const queryClient = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: "require",
});

export const db = drizzle(queryClient, { schema });

export async function closeDbConnection() {
  await queryClient.end();
}

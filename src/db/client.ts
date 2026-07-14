import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
const databaseSslCa = process.env.SUPABASE_DB_CA_CERT?.replace(
  /\\n/g,
  "\n",
).trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

if (!databaseSslCa) {
  throw new Error(
    "SUPABASE_DB_CA_CERT is required in every runtime that connects to the database.",
  );
}

if (
  !databaseSslCa.includes("-----BEGIN CERTIFICATE-----") ||
  !databaseSslCa.includes("-----END CERTIFICATE-----")
) {
  throw new Error("SUPABASE_DB_CA_CERT must contain a PEM certificate.");
}

const queryClient = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: {
    ca: databaseSslCa,
    rejectUnauthorized: true,
  },
});

export const db = drizzle(queryClient, { schema });

export async function closeDbConnection() {
  await queryClient.end();
}

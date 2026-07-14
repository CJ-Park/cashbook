import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", quiet: true });

const databaseUrl = process.env.DATABASE_URL;
const databaseSslCa = process.env.SUPABASE_DB_CA_CERT?.replace(/\\n/g, "\n").trim();
const commandRequiresDatabase = process.argv.some((argument) =>
  ["migrate", "push", "pull", "studio"].includes(argument),
);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

if (commandRequiresDatabase && !databaseSslCa) {
  throw new Error(
    "SUPABASE_DB_CA_CERT is required for Drizzle commands that connect to the database.",
  );
}

if (
  databaseSslCa &&
  (!databaseSslCa.includes("-----BEGIN CERTIFICATE-----") ||
    !databaseSslCa.includes("-----END CERTIFICATE-----"))
) {
  throw new Error("SUPABASE_DB_CA_CERT must contain a PEM certificate.");
}

const parsedDatabaseUrl = new URL(databaseUrl);
const secureDbCredentials = databaseSslCa
  ? {
      host: parsedDatabaseUrl.hostname,
      port: Number(parsedDatabaseUrl.port || 5432),
      user: decodeURIComponent(parsedDatabaseUrl.username),
      password: decodeURIComponent(parsedDatabaseUrl.password),
      database: decodeURIComponent(parsedDatabaseUrl.pathname.replace(/^\//, "")),
      ssl: {
        ca: databaseSslCa,
        rejectUnauthorized: true,
      },
    }
  : { url: databaseUrl };

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: secureDbCredentials,
  schemaFilter: ["public"],
  strict: true,
  verbose: true,
});

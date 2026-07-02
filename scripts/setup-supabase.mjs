/**
 * Apply LamaOS schema to a Supabase project.
 *
 * Usage:
 *   1. Copy env.production.template → .env.production
 *   2. Fill in your NEW project URL, publishable key, and database password
 *   3. npm run setup:supabase
 *
 * Does not touch your local .env (Lovable personal data stays separate).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(root, ".env.production"));

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const publishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl || !dbPassword) {
  console.error(`
Missing credentials. Create .env.production from env.production.template with:

  VITE_SUPABASE_URL=https://YOUR-REF.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
  SUPABASE_URL=https://YOUR-REF.supabase.co
  SUPABASE_PUBLISHABLE_KEY=your-publishable-key
  SUPABASE_DB_PASSWORD=your-database-password
`);
  process.exit(1);
}

const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
const sqlPath = path.join(root, "supabase", "setup-all.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const POOLER_REGIONS = [
  "ap-northeast-1",
  "ap-south-1",
  "us-east-1",
  "eu-west-1",
  "us-west-1",
  "ap-southeast-1",
  "eu-central-1",
];

async function connectClient() {
  const direct = new pg.Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    user: "postgres",
    password: dbPassword,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10_000,
  });

  try {
    await direct.connect();
    return direct;
  } catch {
    await direct.end().catch(() => undefined);
  }

  for (const region of POOLER_REGIONS) {
    const pooled = new pg.Client({
      host: `aws-0-${region}.pooler.supabase.com`,
      port: 5432,
      user: `postgres.${projectRef}`,
      password: dbPassword,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10_000,
    });

    try {
      await pooled.connect();
      console.log(`Connected via pooler (${region})`);
      return pooled;
    } catch {
      await pooled.end().catch(() => undefined);
    }
  }

  throw new Error(
    "Could not connect to the database. Check SUPABASE_DB_PASSWORD and that the project finished provisioning.",
  );
}

console.log(`Connecting to Supabase project: ${projectRef}`);

const client = await connectClient();

try {
  await client.query(sql);

  const { rows } = await client.query(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'user_state'
     ORDER BY ordinal_position`,
  );

  if (rows.length === 0) {
    throw new Error("user_state table was not created.");
  }

  console.log("\n✓ Schema applied successfully.");
  console.log("  user_state columns:", rows.map((r) => r.column_name).join(", "));

  console.log(`
Next — Supabase dashboard (Authentication → URL Configuration):
  Site URL:        https://lama-os.vercel.app
  Redirect URLs:   https://lama-os.vercel.app/**
                   http://localhost:8080/**

Next — Vercel → Settings → Environment Variables (Production):
  VITE_SUPABASE_URL=${supabaseUrl}
  VITE_SUPABASE_PUBLISHABLE_KEY=${publishableKey ?? "<your-publishable-key>"}
  SUPABASE_URL=${supabaseUrl}
  SUPABASE_PUBLISHABLE_KEY=${publishableKey ?? "<your-publishable-key>"}

Then redeploy on Vercel.

Your local .env can stay on Lovable — your personal data is untouched.
`);
} catch (err) {
  console.error("\nSetup failed:", err.message);
  if (err.message.includes("password authentication failed")) {
    console.error("Check SUPABASE_DB_PASSWORD in .env.production (the password you set when creating the project).");
  }
  process.exit(1);
} finally {
  await client.end();
}

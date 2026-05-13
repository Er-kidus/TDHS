// src/lib/server/db.ts
// PostgreSQL database connection pool
// This module is server-only and should only be imported in server-side code

import { Pool } from "pg";

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tdhs",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB] Executed query in ${duration}ms`);
    return result;
  } catch (error) {
    console.error("[DB] Query error:", error);
    throw error;
  }
}

export async function getClient() {
  return pool.connect();
}

export async function closePool() {
  await pool.end();
}

export default pool;

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL env variable not configured");
}

export const db = drizzle(process.env.DATABASE_URL);

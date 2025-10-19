import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Neon
});

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log("📦 Connected to PostgreSQL Database");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

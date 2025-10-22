// db.ts
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

// Usamos la URL del .env
const sql = neon(process.env.DATABASE_URL!);

export default sql;

// Función opcional para testear la conexión
export const testConnection = async () => {
  try {
    const result = await sql`SELECT version()`;
    console.log("✅ Postgres version:", result[0].version);
  } catch (err) {
    console.error("❌ Error conectando a Postgres:", err);
  }
};

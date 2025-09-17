// drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  // ⬇️ 0.21+ : url ; 0.20- : connectionString
  dbCredentials: {
    url: process.env.DATABASE_URL!,              // si 0.21+
    // connectionString: process.env.DATABASE_URL!, // si 0.20-
  },
  strict: true,
  verbose: true,
});

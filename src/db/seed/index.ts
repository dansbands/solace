import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { advocates } from "../schema";
import { advocateData } from "./advocates";

async function seed() {
  try {
    console.log("🌱 Seeding database...");
    
    // Connect directly to database for seeding
    const DATABASE_URL = process.env.DATABASE_URL || "postgresql://Dan@localhost/solaceassignment";
    console.log("Connecting to:", DATABASE_URL);
    
    const client = postgres(DATABASE_URL);
    const db = drizzle(client);
    
    // Clear existing data
    await db.delete(advocates);
    console.log("Cleared existing advocates");
    
    // Insert seed data
    const result = await db.insert(advocates).values(advocateData).returning();
    console.log(`✅ Inserted ${result.length} advocates`);
    
    await client.end();
    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
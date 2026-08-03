import { prisma } from "../../config/prisma.js";

export class DatabaseService {
  static async connect(): Promise<void> {
    await prisma.$connect();
    console.log("✅ PostgreSQL connected");
  }

  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
    console.log("📦 PostgreSQL disconnected");
  }
}
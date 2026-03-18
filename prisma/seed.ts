import * as dotenv from "dotenv";
import * as path from "path";

// Load env vars before any other imports
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function encrypt(text: string): string {
  const key = process.env.ENCRYPTION_KEY!;
  return CryptoJS.AES.encrypt(text, key).toString();
}

async function main() {
  console.log("🌱 Seeding database…");

  const adminPwd = await bcrypt.hash("Admin@123456", 12);
  const userPwd = await bcrypt.hash("User@123456", 12);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@taskmanagerpro.com" },
    update: {},
    create: { name: "Admin User", email: "admin@taskmanagerpro.com", password: adminPwd, role: "ADMIN" },
  });

  // Regular users
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { name: "Alice Johnson", email: "alice@example.com", password: userPwd, role: "USER" },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { name: "Bob Smith", email: "bob@example.com", password: userPwd, role: "USER" },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: { name: "Carol Williams", email: "carol@example.com", password: userPwd, role: "USER" },
  });

  // Admin tasks
  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      { title: "Review system architecture", description: encrypt("Review and update the system architecture for scalability"), status: "IN_PROGRESS", userId: admin.id },
      { title: "User permissions audit", description: encrypt("Conduct quarterly audit of user permissions and roles"), status: "TODO", userId: admin.id },
      { title: "Deploy v2.0 release", description: encrypt("Deploy the new v2.0 release to production servers"), status: "COMPLETED", userId: admin.id },
    ],
  });

  // Alice tasks
  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      { title: "Design new landing page", description: encrypt("Create wireframes and mockups for the new landing page"), status: "IN_PROGRESS", userId: alice.id },
      { title: "Write unit tests", description: encrypt("Add unit tests for authentication module"), status: "TODO", userId: alice.id },
      { title: "Update API docs", description: encrypt("Update Postman collection with new endpoints"), status: "COMPLETED", userId: alice.id },
      { title: "Fix login bug", description: encrypt("Investigate and fix the OAuth login redirect issue"), status: "TODO", userId: alice.id },
    ],
  });

  // Bob tasks
  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      { title: "Database optimization", description: encrypt("Optimize slow-running queries in the analytics module"), status: "TODO", userId: bob.id },
      { title: "Implement dark mode", description: encrypt("Add dark mode toggle to all dashboard components"), status: "COMPLETED", userId: bob.id },
      { title: "Mobile responsive fixes", description: encrypt("Fix layout issues on mobile devices for task cards"), status: "IN_PROGRESS", userId: bob.id },
    ],
  });

  // Carol tasks
  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      { title: "Customer onboarding flow", description: encrypt("Design and implement the new customer onboarding wizard"), status: "TODO", userId: carol.id },
      { title: "Email templates", description: encrypt("Create HTML email templates for notifications"), status: "IN_PROGRESS", userId: carol.id },
      { title: "Performance testing", description: encrypt("Run load tests on all API endpoints"), status: "COMPLETED", userId: carol.id },
    ],
  });

  console.log("✅ Seeding complete!\n");
  console.log("Seed accounts:");
  console.log("  🛡️  Admin : admin@taskmanagerpro.com  /  Admin@123456");
  console.log("  👤 Alice : alice@example.com          /  User@123456");
  console.log("  👤 Bob   : bob@example.com            /  User@123456");
  console.log("  👤 Carol : carol@example.com          /  User@123456");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

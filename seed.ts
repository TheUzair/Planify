import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";

// ── Mongoose models ──────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  },
  { timestamps: true }
);

const TaskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    status: { type: String, enum: ["TODO", "IN_PROGRESS", "COMPLETED"], default: "TODO" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

// ── helpers ──────────────────────────────────────────────────────────────────
function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_KEY!).toString();
}

async function upsertUser(email: string, data: Record<string, unknown>) {
  return User.findOneAndUpdate({ email }, { $setOnInsert: data }, { upsert: true, new: true });
}

async function upsertTask(userId: mongoose.Types.ObjectId, title: string, data: Record<string, unknown>) {
  return Task.findOneAndUpdate({ userId, title }, { $setOnInsert: { ...data, userId, title } }, { upsert: true, new: true });
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.DATABASE_URL!);
  console.log("🌱 Seeding database…");

  const adminPwd = await bcrypt.hash("Admin@123456", 12);
  const userPwd = await bcrypt.hash("User@123456", 12);

  const admin = await upsertUser("admin@planify.com", { name: "Admin User", email: "admin@planify.com", password: adminPwd, role: "ADMIN" });
  const alice = await upsertUser("alice@example.com", { name: "Alice Johnson", email: "alice@example.com", password: userPwd, role: "USER" });
  const bob = await upsertUser("bob@example.com", { name: "Bob Smith", email: "bob@example.com", password: userPwd, role: "USER" });
  const carol = await upsertUser("carol@example.com", { name: "Carol Williams", email: "carol@example.com", password: userPwd, role: "USER" });

  const adminTasks = [
    { title: "Review system architecture", description: encrypt("Review and update the system architecture for scalability"), status: "IN_PROGRESS" },
    { title: "User permissions audit", description: encrypt("Conduct quarterly audit of user permissions and roles"), status: "TODO" },
    { title: "Deploy v2.0 release", description: encrypt("Deploy the new v2.0 release to production servers"), status: "COMPLETED" },
  ];
  const aliceTasks = [
    { title: "Design new landing page", description: encrypt("Create wireframes and mockups for the new landing page"), status: "IN_PROGRESS" },
    { title: "Write unit tests", description: encrypt("Add unit tests for authentication module"), status: "TODO" },
    { title: "Update API docs", description: encrypt("Update Postman collection with new endpoints"), status: "COMPLETED" },
    { title: "Fix login bug", description: encrypt("Investigate and fix the OAuth login redirect issue"), status: "TODO" },
  ];
  const bobTasks = [
    { title: "Database optimization", description: encrypt("Optimize slow-running queries in the analytics module"), status: "TODO" },
    { title: "Implement dark mode", description: encrypt("Add dark mode toggle to all dashboard components"), status: "COMPLETED" },
    { title: "Mobile responsive fixes", description: encrypt("Fix layout issues on mobile devices for task cards"), status: "IN_PROGRESS" },
  ];
  const carolTasks = [
    { title: "Customer onboarding flow", description: encrypt("Design and implement the new customer onboarding wizard"), status: "TODO" },
    { title: "Email templates", description: encrypt("Create HTML email templates for notifications"), status: "IN_PROGRESS" },
    { title: "Performance testing", description: encrypt("Run load tests on all API endpoints"), status: "COMPLETED" },
  ];

  for (const t of adminTasks) await upsertTask(admin._id, t.title, t);
  for (const t of aliceTasks) await upsertTask(alice._id, t.title, t);
  for (const t of bobTasks) await upsertTask(bob._id, t.title, t);
  for (const t of carolTasks) await upsertTask(carol._id, t.title, t);

  console.log("✅ Seeding complete!\n");
  console.log("Seed accounts:");
  console.log("  🛡️  Admin : admin@planify.com  /  Admin@123456");
  console.log("  👤 Alice : alice@example.com          /  User@123456");
  console.log("  👤 Bob   : bob@example.com            /  User@123456");
  console.log("  👤 Carol : carol@example.com          /  User@123456");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => mongoose.disconnect());

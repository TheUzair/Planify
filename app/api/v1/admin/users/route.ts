import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Task from "@/lib/models/Task";
import { requireAdmin } from "@/lib/rbac";
import mongoose from "mongoose";

// GET /api/v1/admin/users — list all users with task counts
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  await connectDB();
  const rawUsers = await User.find().select("-password").sort({ createdAt: -1 }).lean();

  const users = await Promise.all(
    rawUsers.map(async (u: Record<string, unknown>) => {
      const taskCount = await Task.countDocuments({ userId: u._id as mongoose.Types.ObjectId });
      return {
        id: (u._id as mongoose.Types.ObjectId).toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        image: u.image,
        createdAt: u.createdAt,
        _count: { tasks: taskCount },
      };
    })
  );

  return NextResponse.json({ users });
}

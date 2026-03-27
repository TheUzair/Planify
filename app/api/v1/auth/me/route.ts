import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Task from "@/lib/models/Task";
import { requireAuth } from "@/lib/rbac";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  await connectDB();
  const dbUser = await User.findById(user.id).select("-password").lean();

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const taskCount = await Task.countDocuments({ userId: new mongoose.Types.ObjectId(user.id) });

  return NextResponse.json({
    user: {
      id: dbUser._id.toString(),
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      image: dbUser.image,
      createdAt: dbUser.createdAt,
      _count: { tasks: taskCount },
    },
  });
}

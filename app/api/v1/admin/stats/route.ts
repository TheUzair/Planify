import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Task from "@/lib/models/Task";
import { requireAdmin } from "@/lib/rbac";
import mongoose from "mongoose";

// GET /api/v1/admin/stats — platform-wide stats
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  await connectDB();

  const [totalUsers, adminCount, totalTasks, tasksByStatusRaw, rawRecentUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "ADMIN" }),
    Task.countDocuments(),
    Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    User.find().sort({ createdAt: -1 }).limit(5).select("-password").lean(),
  ]);

  const tasksByStatus = (tasksByStatusRaw as { _id: string; count: number }[]).reduce(
    (acc: Record<string, number>, cur) => ({ ...acc, [cur._id]: cur.count }),
    {}
  );

  const recentUsers = (rawRecentUsers as Record<string, unknown>[]).map((u) => ({
    id: (u._id as mongoose.Types.ObjectId).toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));

  return NextResponse.json({
    stats: {
      totalUsers,
      adminCount,
      userCount: totalUsers - adminCount,
      totalTasks,
      tasksByStatus,
      recentUsers,
    },
  });
}

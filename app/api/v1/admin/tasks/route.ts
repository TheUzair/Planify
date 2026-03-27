import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/lib/models/Task";
import { requireAdmin } from "@/lib/rbac";
import { decrypt } from "@/lib/encryption";
import { taskQuerySchema } from "@/lib/validations";
import mongoose from "mongoose";
import { z } from "zod";

// GET /api/v1/admin/tasks — all tasks across all users
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const { page, limit, status, search } = taskQuerySchema.parse(queryParams);
    const skip = (page - 1) * limit;

    await connectDB();
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    const [rawTasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate("userId", "_id name email role")
        .lean(),
      Task.countDocuments(filter),
    ]);

    const tasks = (rawTasks as Record<string, unknown>[]).map((t) => {
      const u = t.userId as Record<string, unknown>;
      return {
        id: (t._id as mongoose.Types.ObjectId).toString(),
        title: t.title,
        description: t.description ? (() => { try { return decrypt(t.description as string); } catch { return ""; } })() : null,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        user: u?._id ? { id: (u._id as mongoose.Types.ObjectId).toString(), name: u.name, email: u.email, role: u.role } : undefined,
      };
    });

    return NextResponse.json({
      tasks,
      pagination: {
        total, page, limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

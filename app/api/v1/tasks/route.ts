import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/lib/models/Task";
import { requireAuth } from "@/lib/rbac";
import { createTaskSchema, taskQuerySchema } from "@/lib/validations";
import { encrypt, decrypt } from "@/lib/encryption";
import mongoose from "mongoose";
import { z } from "zod";

function serializeTask(t: Record<string, unknown>, decryptDesc = true) {
  const description = t.description
    ? decryptDesc ? (() => { try { return decrypt(t.description as string); } catch { return ""; } })()
      : t.description
    : null;
  const user = t.userId && typeof t.userId === "object" && "_id" in (t.userId as Record<string, unknown>)
    ? (() => { const u = t.userId as Record<string, unknown>; return { id: (u._id as mongoose.Types.ObjectId).toString(), name: u.name, email: u.email }; })()
    : undefined;
  return {
    id: (t._id as mongoose.Types.ObjectId).toString(),
    title: t.title,
    description,
    status: t.status,
    userId: user ? user.id : (t.userId as mongoose.Types.ObjectId)?.toString(),
    user,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

// GET /api/v1/tasks
export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const { page, limit, status, search } = taskQuerySchema.parse(queryParams);
    const skip = (page - 1) * limit;

    await connectDB();
    const filter: Record<string, unknown> = {};
    if (user.role === "ADMIN") {
      const filterUserId = searchParams.get("userId");
      if (filterUserId && mongoose.isValidObjectId(filterUserId))
        filter.userId = new mongoose.Types.ObjectId(filterUserId);
    } else {
      filter.userId = new mongoose.Types.ObjectId(user.id);
    }
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    const [rawTasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate("userId", "_id name email")
        .lean(),
      Task.countDocuments(filter),
    ]);

    const tasks = (rawTasks as Record<string, unknown>[]).map((t) => serializeTask(t));

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
    console.error("GET /api/v1/tasks error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/tasks
export async function POST(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    await connectDB();
    const encryptedDescription = validatedData.description ? encrypt(validatedData.description) : null;

    const doc = await Task.create({
      title: validatedData.title,
      description: encryptedDescription,
      status: validatedData.status,
      userId: new mongoose.Types.ObjectId(user.id),
    });

    return NextResponse.json(
      {
        message: "Task created successfully",
        task: {
          id: doc._id.toString(),
          title: doc.title,
          description: validatedData.description ?? null,
          status: doc.status,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    console.error("POST /api/v1/tasks error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

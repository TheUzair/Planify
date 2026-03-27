import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/lib/models/Task";
import { createTaskSchema, taskQuerySchema } from "@/lib/validations";
import { encrypt, decrypt } from "@/lib/encryption";
import mongoose from "mongoose";
import { z } from "zod";

// GET /api/tasks - List tasks with pagination, filtering, and search
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const { page, limit, status, search } = taskQuerySchema.parse(queryParams);

    const skip = (page - 1) * limit;

    await connectDB();

    if (!mongoose.isValidObjectId(session.user.id)) {
      return NextResponse.json({ error: "Invalid session. Please sign out and sign in again." }, { status: 401 });
    }

    const uid = new mongoose.Types.ObjectId(session.user.id);
    const filter: Record<string, unknown> = { userId: uid };
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    const [rawTasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Task.countDocuments(filter),
    ]);

    const tasks = rawTasks.map((t: Record<string, unknown>) => ({
      id: (t._id as mongoose.Types.ObjectId).toString(),
      title: t.title,
      description: t.description ? decrypt(t.description as string) : null,
      status: t.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      tasks,
      pagination: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.issues }, { status: 400 });
    }
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Encrypt sensitive description if provided
    await connectDB();
    const encryptedDescription = validatedData.description
      ? encrypt(validatedData.description)
      : null;

    const doc = await Task.create({
      title: validatedData.title,
      description: encryptedDescription,
      status: validatedData.status,
      userId: new mongoose.Types.ObjectId(session.user.id),
    });

    const task = {
      id: doc._id.toString(),
      title: doc.title,
      description: validatedData.description ?? null,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return NextResponse.json({ message: "Task created successfully", task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/lib/models/Task";
import { updateTaskSchema } from "@/lib/validations";
import { encrypt, decrypt } from "@/lib/encryption";
import mongoose from "mongoose";
import { z } from "zod";

function serializeTask(t: Record<string, unknown>) {
  return {
    id: (t._id as mongoose.Types.ObjectId).toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    userId: t.userId ? (t.userId as mongoose.Types.ObjectId).toString() : undefined,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

// GET /api/tasks/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    await connectDB();
    const raw = await Task.findById(id).lean() as Record<string, unknown> | null;
    if (!raw) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if ((raw.userId as mongoose.Types.ObjectId).toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const task = serializeTask(raw);
    if (task.description) {
      try { task.description = decrypt(task.description as string); } catch { task.description = ""; }
    }
    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/tasks/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    await connectDB();
    const existing = await Task.findById(id).lean() as Record<string, unknown> | null;
    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if ((existing.userId as mongoose.Types.ObjectId).toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description ? encrypt(validatedData.description) : null;
    }
    if (validatedData.status !== undefined) updateData.status = validatedData.status;

    const updated = await Task.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean() as Record<string, unknown>;
    const task = serializeTask(updated);
    if (task.description) {
      try { task.description = decrypt(task.description as string); } catch { task.description = ""; }
    }
    return NextResponse.json({ message: "Task updated successfully", task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    await connectDB();
    const existing = await Task.findById(id).lean() as Record<string, unknown> | null;
    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if ((existing.userId as mongoose.Types.ObjectId).toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await Task.findByIdAndDelete(id);
    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

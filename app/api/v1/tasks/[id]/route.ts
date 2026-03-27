import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/lib/models/Task";
import { requireAuth } from "@/lib/rbac";
import { updateTaskSchema } from "@/lib/validations";
import { encrypt, decrypt } from "@/lib/encryption";
import mongoose from "mongoose";
import { z } from "zod";

// GET /api/v1/tasks/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await connectDB();
  const task = await Task.findById(id).populate("userId", "_id name email role").lean() as Record<string, unknown> | null;
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const ownerId = (task.userId as Record<string, unknown>)._id
    ? ((task.userId as Record<string, unknown>)._id as mongoose.Types.ObjectId).toString()
    : (task.userId as mongoose.Types.ObjectId).toString();

  if (user.role !== "ADMIN" && ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const u = task.userId as Record<string, unknown>;
  return NextResponse.json({
    task: {
      id: (task._id as mongoose.Types.ObjectId).toString(),
      title: task.title,
      description: task.description ? (() => { try { return decrypt(task.description as string); } catch { return ""; } })() : null,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      user: u._id ? { id: (u._id as mongoose.Types.ObjectId).toString(), name: u.name, email: u.email, role: u.role } : undefined,
    },
  });
}

// PUT /api/v1/tasks/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  try {
    await connectDB();
    const existing = await Task.findById(id).lean() as Record<string, unknown> | null;
    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (user.role !== "ADMIN" && (existing.userId as mongoose.Types.ObjectId).toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const updatePayload: Record<string, unknown> = {};
    if (validatedData.title !== undefined) updatePayload.title = validatedData.title;
    if (validatedData.description !== undefined) {
      updatePayload.description = validatedData.description ? encrypt(validatedData.description) : null;
    }
    if (validatedData.status !== undefined) updatePayload.status = validatedData.status;

    const updated = await Task.findByIdAndUpdate(id, { $set: updatePayload }, { new: true }).lean() as Record<string, unknown>;
    return NextResponse.json({
      message: "Task updated successfully",
      task: {
        id: (updated._id as mongoose.Types.ObjectId).toString(),
        title: updated.title,
        description: validatedData.description ?? null,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/tasks/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await connectDB();
  const existing = await Task.findById(id).lean() as Record<string, unknown> | null;
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  if (user.role !== "ADMIN" && (existing.userId as mongoose.Types.ObjectId).toString() !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Task.findByIdAndDelete(id);
  return NextResponse.json({ message: "Task deleted successfully" });
}

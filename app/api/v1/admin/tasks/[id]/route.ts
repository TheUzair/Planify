import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/lib/models/Task";
import { requireAdmin } from "@/lib/rbac";
import mongoose from "mongoose";

// DELETE /api/v1/admin/tasks/[id] — admin can hard-delete any task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await connectDB();
  const existing = await Task.findById(id).lean();
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await Task.findByIdAndDelete(id);
  return NextResponse.json({ message: "Task deleted successfully" });
}

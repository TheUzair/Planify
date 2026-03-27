import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Task from "@/lib/models/Task";
import { requireAdmin } from "@/lib/rbac";
import mongoose from "mongoose";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

// GET /api/v1/admin/users/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await connectDB();
  const raw = await User.findById(id).select("-password").lean() as Record<string, unknown> | null;
  if (!raw) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const tasks = await Task.find({ userId: new mongoose.Types.ObjectId(id) })
    .sort({ createdAt: -1 })
    .select("_id title status createdAt")
    .lean() as Record<string, unknown>[];

  return NextResponse.json({
    user: {
      id: (raw._id as mongoose.Types.ObjectId).toString(),
      name: raw.name,
      email: raw.email,
      role: raw.role,
      image: raw.image,
      createdAt: raw.createdAt,
      tasks: tasks.map((t) => ({
        id: (t._id as mongoose.Types.ObjectId).toString(),
        title: t.title,
        status: t.status,
        createdAt: t.createdAt,
      })),
    },
  });
}

// PATCH /api/v1/admin/users/[id] — change role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  if (adminUser!.id === id) {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
  }
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const body = await request.json();
    const { role } = updateRoleSchema.parse(body);

    await connectDB();
    const updated = await User.findByIdAndUpdate(id, { role }, { new: true }).select("_id name email role").lean() as Record<string, unknown> | null;
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      message: `User role updated to ${role}`,
      user: { id: (updated._id as mongoose.Types.ObjectId).toString(), name: updated.name, email: updated.email, role: updated.role },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid role value" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/admin/users/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  if (adminUser!.id === id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await connectDB();
  const existing = await User.findById(id).lean();
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await Promise.all([
    User.findByIdAndDelete(id),
    Task.deleteMany({ userId: new mongoose.Types.ObjectId(id) }),
  ]);

  return NextResponse.json({ message: "User and all associated data deleted successfully" });
}

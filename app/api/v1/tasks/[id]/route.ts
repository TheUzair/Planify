import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { updateTaskSchema } from "@/lib/validations";
import { encrypt, decrypt } from "@/lib/encryption";
import { z } from "zod";

// GET /api/v1/tasks/[id]
// USER: own tasks only | ADMIN: any task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  if (user.role !== "ADMIN" && task.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    task: { ...task, description: task.description ? decrypt(task.description) : null },
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

  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (user.role !== "ADMIN" && existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description ? encrypt(validatedData.description) : null,
        }),
        ...(validatedData.status && { status: validatedData.status }),
      },
      select: { id: true, title: true, description: true, status: true, updatedAt: true },
    });

    return NextResponse.json({
      message: "Task updated successfully",
      task: { ...updated, description: validatedData.description ?? null },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
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

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  if (user.role !== "ADMIN" && existing.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ message: "Task deleted successfully" });
}

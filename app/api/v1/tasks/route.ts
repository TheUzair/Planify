import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { createTaskSchema, taskQuerySchema } from "@/lib/validations";
import { encrypt, decrypt } from "@/lib/encryption";
import { z } from "zod";

// GET /api/v1/tasks
// USER: sees only their own tasks
// ADMIN: sees all tasks (optional ?userId= filter)
export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const { page, limit, status, search } = taskQuerySchema.parse(queryParams);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (user.role === "ADMIN") {
      const filterUserId = searchParams.get("userId");
      if (filterUserId) where.userId = filterUserId;
    } else {
      where.userId = user.id;
    }
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    const decryptedTasks = tasks.map((task: typeof tasks[0]) => ({
      ...task,
      description: task.description ? decrypt(task.description) : null,
    }));

    return NextResponse.json({
      tasks: decryptedTasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: err.issues },
        { status: 400 }
      );
    }
    console.error("GET /api/v1/tasks error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/tasks — any authenticated user creates a task for themselves
export async function POST(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const encryptedDescription = validatedData.description
      ? encrypt(validatedData.description)
      : null;

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: encryptedDescription,
        status: validatedData.status,
        userId: user.id,
      },
      select: { id: true, title: true, description: true, status: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json(
      {
        message: "Task created successfully",
        task: { ...task, description: validatedData.description ?? null },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/v1/tasks error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

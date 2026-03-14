import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTaskSchema, taskQuerySchema } from "@/lib/validations";
import { encrypt, decrypt } from "@/lib/encryption";
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

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get tasks and total count
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.task.count({ where }),
    ]);

    // Decrypt descriptions
    const decryptedTasks = tasks.map(task => ({
      ...task,
      description: task.description ? decrypt(task.description) : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      tasks: decryptedTasks,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
    const encryptedDescription = validatedData.description
      ? encrypt(validatedData.description)
      : null;

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: encryptedDescription,
        status: validatedData.status,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations";
import { encrypt, decrypt } from "@/lib/encryption";
import { z } from "zod";

// GET /api/tasks/[id] - Get a single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user owns this task
    if (task.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Decrypt description if it exists
    if (task.description) {
      try {
        task.description = decrypt(task.description);
      } catch (error) {
        console.error("Error decrypting description:", error);
        task.description = "";
      }
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // Check if task exists and user owns it
    const existingTask = await prisma.task.findUnique({
      where: {
        id,
      },
      select: {
        userId: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }

    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description
        ? encrypt(validatedData.description)
        : null;
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    const task = await prisma.task.update({
      where: {
        id,
      },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Decrypt description for response
    if (task.description) {
      try {
        task.description = decrypt(task.description);
      } catch (error) {
        console.error("Error decrypting description:", error);
        task.description = "";
      }
    }

    return NextResponse.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if task exists and user owns it
    const existingTask = await prisma.task.findUnique({
      where: {
        id,
      },
      select: {
        userId: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.task.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

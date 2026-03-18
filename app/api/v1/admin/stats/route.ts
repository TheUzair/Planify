import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

// GET /api/v1/admin/stats — platform-wide stats
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const [totalUsers, adminCount, totalTasks, tasksByStatus, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.task.count(),
    prisma.task.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalUsers,
      adminCount,
      userCount: totalUsers - adminCount,
      totalTasks,
      tasksByStatus: tasksByStatus.reduce(
        (acc: Record<string, number>, curr) => ({ ...acc, [curr.status]: curr._count.status }),
        {}
      ),
      recentUsers,
    },
  });
}

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  image: string | null;
  createdAt: string;
  _count: { tasks: number };
}

interface AdminTask {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
  userId: string;
  user: { id: string; name: string | null; email: string };
}

interface Stats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  recentUsers: AdminUser[];
}

const STATUS_CONFIG = {
  TODO: { label: "To Do", icon: ExclamationCircleIcon, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800" },
  IN_PROGRESS: { label: "In Progress", icon: ClockIcon, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800" },
  COMPLETED: { label: "Completed", icon: CheckCircleIcon, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800" },
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "tasks">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskSearch, setTaskSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Modal state
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [editRoleUser, setEditRoleUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [deleteTask, setDeleteTask] = useState<AdminTask | null>(null);
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");
  const [actionLoading, setActionLoading] = useState(false);
  const [userDetail, setUserDetail] = useState<(AdminUser & { tasks: AdminTask[] }) | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, tasksRes] = await Promise.all([
        fetch("/api/v1/admin/stats"),
        fetch("/api/v1/admin/users"),
        fetch("/api/v1/admin/tasks?limit=50"),
      ]);
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users);
      }
      if (tasksRes.ok) {
        const d = await tasksRes.json();
        setTasks(d.tasks);
      }
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      if ((session.user as { role?: string }).role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      fetchAll();
    }
  }, [status, session, router, fetchAll]);

  const openViewUser = async (user: AdminUser) => {
    setViewUser(user);
    const res = await fetch(`/api/v1/admin/users/${user.id}`);
    if (res.ok) {
      const d = await res.json();
      setUserDetail(d.user);
    }
  };

  const handleRoleUpdate = async () => {
    if (!editRoleUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${editRoleUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success(`Role updated to ${newRole}`);
        setEditRoleUser(null);
        fetchAll();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to update role");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${deleteUser.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User deleted successfully");
        setDeleteUser(null);
        fetchAll();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to delete user");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTask) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/tasks/${deleteTask.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted successfully");
        setDeleteTask(null);
        fetchAll();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to delete task");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.user?.name?.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(taskSearch.toLowerCase())
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <motion.div
          className="h-14 w-14 border-4 border-indigo-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: ChartBarIcon },
    { id: "users" as const, label: `Users (${users.length})`, icon: UsersIcon },
    { id: "tasks" as const, label: `Tasks (${tasks.length})`, icon: ClipboardDocumentListIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl" />
        <div className="absolute top-60 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-indigo-200/50 dark:border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
              <p className="text-xs text-muted-foreground">Task Manager Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
              <ShieldCheckIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{session?.user?.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="hidden sm:flex"
            >
              Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/20 transition-all"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total Users", value: stats.totalUsers, icon: UsersIcon, color: "from-blue-500 to-indigo-500" },
              { label: "Admin Users", value: stats.adminCount, icon: ShieldCheckIcon, color: "from-purple-500 to-pink-500" },
              { label: "Total Tasks", value: stats.totalTasks, icon: ClipboardDocumentListIcon, color: "from-indigo-500 to-purple-500" },
              { label: "Completed", value: stats.tasksByStatus?.COMPLETED ?? 0, icon: CheckCircleIcon, color: "from-green-500 to-emerald-500" },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl p-5 border border-indigo-200/60 dark:border-border shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-indigo-200/60 dark:border-border shadow-sm overflow-hidden"
        >
          {/* Tab bar */}
          <div className="flex border-b border-indigo-200/60 dark:border-border bg-indigo-50/50 dark:bg-gray-900/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all cursor-pointer relative ${activeTab === tab.id
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="admin-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
                  />
                )}
              </button>
            ))}
            <div className="ml-auto flex items-center px-4">
              <Button variant="ghost" size="sm" onClick={fetchAll} className="cursor-pointer">
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ── OVERVIEW TAB ── */}
              {activeTab === "overview" && stats && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Task breakdown */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Task Breakdown</h3>
                      <div className="space-y-3">
                        {(["TODO", "IN_PROGRESS", "COMPLETED"] as const).map((s) => {
                          const count = stats.tasksByStatus?.[s] ?? 0;
                          const pct = stats.totalTasks ? Math.round((count / stats.totalTasks) * 100) : 0;
                          const cfg = STATUS_CONFIG[s];
                          return (
                            <div key={s}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-muted-foreground">{cfg.label}</span>
                                <span className="text-sm font-medium">{count} ({pct}%)</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 }}
                                  className={`h-full rounded-full ${s === "TODO" ? "bg-amber-400" : s === "IN_PROGRESS" ? "bg-blue-500" : "bg-green-500"}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recent users */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Recent Users</h3>
                      <div className="space-y-2">
                        {stats.recentUsers.map((u) => (
                          <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {u.name?.[0] ?? u.email[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{u.name ?? u.email}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"}`}>
                              {u.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── USERS TAB ── */}
              {activeTab === "users" && (
                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-4 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email…"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 bg-white/80 dark:bg-background/50 border-indigo-200 dark:border-border"
                    />
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-indigo-200/60 dark:border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-indigo-50/80 dark:bg-indigo-900/10 text-left">
                          <th className="px-4 py-3 font-semibold text-muted-foreground">User</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground">Role</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Tasks</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground">Joined</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, i) => (
                          <motion.tr
                            key={u.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="border-t border-indigo-100 dark:border-border hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {u.name?.[0] ?? u.email[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{u.name ?? "—"}</p>
                                  <p className="text-xs text-muted-foreground">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">{u._count.tasks}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openViewUser(u)}
                                  className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 cursor-pointer"
                                  title="View user"
                                >
                                  <EyeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => { setEditRoleUser(u); setNewRole(u.role); }}
                                  className="h-7 w-7 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 cursor-pointer"
                                  title="Change role"
                                  disabled={u.id === session?.user?.id}
                                >
                                  <PencilSquareIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteUser(u)}
                                  className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer"
                                  title="Delete user"
                                  disabled={u.id === session?.user?.id}
                                >
                                  <TrashIcon className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground">No users found</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── TASKS TAB ── */}
              {activeTab === "tasks" && (
                <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-4 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks by title or user…"
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="pl-10 bg-white/80 dark:bg-background/50 border-indigo-200 dark:border-border"
                    />
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-indigo-200/60 dark:border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-indigo-50/80 dark:bg-indigo-900/10 text-left">
                          <th className="px-4 py-3 font-semibold text-muted-foreground">Title</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground">Owner</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground">Created</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTasks.map((t, i) => {
                          const cfg = STATUS_CONFIG[t.status];
                          return (
                            <motion.tr
                              key={t.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="border-t border-indigo-100 dark:border-border hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                            >
                              <td className="px-4 py-3 font-medium text-foreground max-w-xs truncate">{t.title}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                                  <cfg.icon className="w-3 h-3" />
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-foreground">{t.user?.name ?? "—"}</p>
                                  <p className="text-xs text-muted-foreground">{t.user?.email}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                {new Date(t.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteTask(t)}
                                  className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer"
                                >
                                  <TrashIcon className="h-4 w-4 text-red-500" />
                                </Button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredTasks.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground">No tasks found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* ── VIEW USER MODAL ── */}
      <Dialog open={!!viewUser} onOpenChange={() => { setViewUser(null); setUserDetail(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto glass border-2">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {viewUser?.name?.[0] ?? viewUser?.email[0].toUpperCase()}
              </div>
              <div>
                <DialogTitle>{viewUser?.name ?? "User"}</DialogTitle>
                <p className="text-sm text-muted-foreground">{viewUser?.email}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${viewUser?.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"}`}>
                {viewUser?.role}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {userDetail?.tasks?.length ?? viewUser?._count.tasks ?? 0} tasks
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Joined {viewUser && new Date(viewUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>

            {userDetail?.tasks && userDetail.tasks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Recent Tasks</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userDetail.tasks.map((t) => {
                    const cfg = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG];
                    return (
                      <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-border">
                        <span className="text-sm truncate flex-1 mr-2">{t.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── EDIT ROLE MODAL ── */}
      <Dialog open={!!editRoleUser} onOpenChange={() => setEditRoleUser(null)}>
        <DialogContent className="max-w-sm glass border-2">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Update role for <span className="font-medium text-foreground">{editRoleUser?.name ?? editRoleUser?.email}</span>
            </p>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as "USER" | "ADMIN")}>
              <SelectTrigger className="bg-background/50 border-2 border-indigo-200 dark:border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">👤 User — standard access, own tasks only</SelectItem>
                <SelectItem value="ADMIN">🛡️ Admin — full platform access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleUser(null)} disabled={actionLoading}>Cancel</Button>
            <Button
              onClick={handleRoleUpdate}
              disabled={actionLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              {actionLoading ? (
                <motion.div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
              ) : null}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE USER MODAL ── */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent className="max-w-sm glass border-2 border-red-200 dark:border-red-900">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle>Delete User</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Permanently delete <span className="font-semibold text-foreground">{deleteUser?.name ?? deleteUser?.email}</span> and all their tasks? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)} disabled={actionLoading}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <motion.div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
              ) : null}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE TASK MODAL ── */}
      <Dialog open={!!deleteTask} onOpenChange={() => setDeleteTask(null)}>
        <DialogContent className="max-w-sm glass border-2 border-red-200 dark:border-red-900">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle>Delete Task</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Permanently delete &ldquo;<span className="font-semibold text-foreground">{deleteTask?.title}</span>&rdquo; by {deleteTask?.user?.name ?? deleteTask?.user?.email}? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTask(null)} disabled={actionLoading}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <motion.div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
              ) : null}
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

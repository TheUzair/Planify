"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { ThemeToggle } from "@/components/theme-toggle"; // Removed as it's in footer
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { ViewTaskModal } from "@/components/tasks/view-task-modal";
import { EditTaskModal } from "@/components/tasks/edit-task-modal";
import { DeleteTaskModal } from "@/components/tasks/delete-task-modal";
import { TaskCard } from "@/components/tasks/task-card";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState("");

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "9",
      });

      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/tasks?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchTasks();
    }
  }, [status, router, fetchTasks]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (status === "authenticated") {
        setCurrentPage(1);
        fetchTasks();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, status, fetchTasks]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const handleViewTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsViewModalOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = (taskId: string, title: string) => {
    setSelectedTaskId(taskId);
    setSelectedTaskTitle(title);
    setIsDeleteModalOpen(true);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      {/* Floating Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-linear-to-r from-indigo-500/8 to-purple-500/8 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -right-40 w-80 h-80 bg-linear-to-r from-blue-500/8 to-cyan-500/8 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-linear-to-r from-purple-500/8 to-pink-500/8 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header with Glass Effect */}
      <header className="sticky top-0 z-40 bg-muted/30 border-b border-border backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gradient">
                Planify
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl glass border border-border/50">
                <UserCircleIcon className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm text-foreground">{session.user?.name || session.user?.email}</span>
              </div>
              {/* ThemeToggle removed - now in footer */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:border-red-900 dark:hover:text-red-400 transition-all"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{session.user?.name?.split(' ')[0] || 'User'}</span>! 👋
          </h2>
          <p className="opacity-70 text-lg">
            {tasks.length === 0
              ? "Let's create your first task to get started"
              : `You have ${tasks.filter(t => t.status !== 'COMPLETED').length} active task${tasks.filter(t => t.status !== 'COMPLETED').length !== 1 ? 's' : ''} to complete`
            }
          </p>
        </motion.div>

        {/* Controls with Glass Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="glass rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="sm:w-auto w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Task
              </Button>
              <div className="flex-1 relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search tasks by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background/50 backdrop-blur-sm border-2 focus:border-primary transition-all"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-12 bg-background/50 backdrop-blur-sm border-2 focus:border-primary">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Tasks</SelectItem>
                  <SelectItem value="TODO">📝 To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">⚡ In Progress</SelectItem>
                  <SelectItem value="COMPLETED">✅ Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats Bar */}
            {tasks.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-yellow-500/5 dark:bg-yellow-500/10">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {tasks.filter(t => t.status === 'TODO').length}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">To Do</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/5 dark:bg-blue-500/10">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">In Progress</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/5 dark:bg-green-500/10">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {tasks.filter(t => t.status === 'COMPLETED').length}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">Completed</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tasks Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              className="relative h-16 w-16 mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-primary/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"></div>
            </motion.div>
            <p className="text-muted-foreground animate-pulse">Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl p-12 text-center shadow-xl"
          >
            <div className="max-w-md mx-auto">
              {/* Empty State Icon */}
              <div className="mb-6 relative">
                <div className="w-32 h-32 mx-auto rounded-full bg-linear-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <svg className="w-16 h-16 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute top-0 right-1/4 w-8 h-8 bg-yellow-400 rounded-full blur-sm animate-float"></div>
                <div className="absolute bottom-0 left-1/4 w-6 h-6 bg-pink-400 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }}></div>
              </div>

              <h3 className="text-2xl font-bold mb-3">No Tasks Found</h3>
              <p className="text-muted-foreground mb-8">
                {searchQuery || statusFilter !== 'ALL'
                  ? "Try adjusting your filters or search query"
                  : "Start your productivity journey by creating your first task!"
                }
              </p>

              {(!searchQuery && statusFilter === 'ALL') && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  size="lg"
                  className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Task
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TaskCard
                    task={task}
                    onView={handleViewTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Modern Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={!pagination.hasPrev}
                    className="glass hover:glass transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>

                  <div className="flex items-center gap-2 px-6 py-2 glass rounded-lg">
                    <span className="text-sm font-medium">
                      Page <span className="text-primary font-bold">{pagination.page}</span> of {pagination.totalPages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!pagination.hasNext}
                    className="glass hover:glass transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground px-4 py-2 glass rounded-lg">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tasks
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={() => {
          setCurrentPage(1);
          fetchTasks();
        }}
      />
      <ViewTaskModal
        taskId={selectedTaskId}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTaskId(null);
        }}
      />
      <EditTaskModal
        taskId={selectedTaskId}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTaskId(null);
        }}
        onTaskUpdated={fetchTasks}
      />
      <DeleteTaskModal
        taskId={selectedTaskId}
        taskTitle={selectedTaskTitle}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTaskId(null);
        }}
        onTaskDeleted={fetchTasks}
      />
    </div>
  );
}

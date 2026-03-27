"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskCardProps {
  task: Task;
  onView: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string, title: string) => void;
}

export function TaskCard({ task, onView, onEdit, onDelete }: TaskCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "TODO":
        return {
          badge: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
          gradient: "from-yellow-500/5 to-yellow-500/0",
          icon: "📝",
          label: "To Do"
        };
      case "IN_PROGRESS":
        return {
          badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
          gradient: "from-blue-500/5 to-blue-500/0",
          icon: "⚡",
          label: "In Progress"
        };
      case "COMPLETED":
        return {
          badge: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
          gradient: "from-green-500/5 to-green-500/0",
          icon: "✅",
          label: "Completed"
        };
      default:
        return {
          badge: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
          gradient: "from-gray-500/5 to-gray-500/0",
          icon: "📋",
          label: status
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusConfig = getStatusConfig(task.status);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={`h-full flex flex-col hover:shadow-lg transition-all duration-300 border hover:border-primary/20 bg-linear-to-br ${statusConfig.gradient} relative overflow-hidden group`}>
        {/* Decorative Corner Gradient */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-primary/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                {task.title}
              </h3>
            </div>
            <Badge className={`${statusConfig.badge} border font-medium shrink-0`}>
              <span className="mr-1">{statusConfig.icon}</span>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-4 relative z-10 flex-1 flex flex-col">
          {task.description ? (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {task.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No description provided
            </p>
          )}

          <div className="flex items-center justify-end gap-2 mt-auto pt-4 text-xs text-muted-foreground text-right">
            <ClockIcon className="h-4 w-4 opacity-70" />
            <span>Created {formatDate(task.createdAt)}</span>
          </div>
        </CardContent>

        <CardFooter className="mt-auto flex gap-2 pt-4 border-t border-border/50 relative z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(task.id)}
            className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/20 dark:hover:border-blue-800 dark:hover:text-blue-400 transition-all"
          >
            <EyeIcon className="h-4 w-4 mr-1.5" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(task.id)}
            className="flex-1 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 dark:hover:bg-purple-950/20 dark:hover:border-purple-800 dark:hover:text-purple-400 transition-all"
          >
            <PencilIcon className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(task.id, task.title)}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-all"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

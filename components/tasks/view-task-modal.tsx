"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ViewTaskModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewTaskModal({ taskId, isOpen, onClose }: ViewTaskModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }

      const data = await response.json();
      setTask(data.task);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTask();
    }
  }, [isOpen, taskId, fetchTask]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-yellow-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "COMPLETED":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "TODO":
        return "To Do";
      case "IN_PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            View complete information about this task
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 text-center py-4">{error}</div>
        ) : task ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Title</h3>
              <p className="text-lg font-semibold">{task.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
              <Badge className={getStatusColor(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>

            {task.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{task.description}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Created At
                </h3>
                <p className="text-sm">{formatDate(task.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Last Updated
                </h3>
                <p className="text-sm">{formatDate(task.updatedAt)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

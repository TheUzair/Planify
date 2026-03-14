"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface DeleteTaskModalProps {
  taskId: string | null;
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onTaskDeleted: () => void;
}

export function DeleteTaskModal({
  taskId,
  taskTitle,
  isOpen,
  onClose,
  onTaskDeleted,
}: DeleteTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!taskId) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete task");
      }

      toast.success("Task deleted successfully!");
      onTaskDeleted();
      onClose();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <DialogTitle>Delete Task</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            Are you sure you want to delete <span className="font-semibold">&quot;{taskTitle}&quot;</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Deleting...
              </span>
            ) : (
              "Delete Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

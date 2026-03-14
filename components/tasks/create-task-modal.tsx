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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create task");
      }

      setTitle("");
      setDescription("");
      setStatus("TODO");
      toast.success("Task created successfully!");
      onTaskCreated();
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto glass border-2">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-2xl">Create New Task</DialogTitle>
              <DialogDescription className="text-base">
                Add a new task to boost your productivity 🚀
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Complete project documentation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 bg-background/50 backdrop-blur-sm border-2 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
            <textarea
              id="description"
              placeholder="Add more details about your task... (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="w-full min-h-32 px-3 py-2.5 text-sm rounded-lg border-2 border-input bg-background/50 backdrop-blur-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
              <SelectTrigger className="h-11 bg-background/50 backdrop-blur-sm border-2 focus:border-primary">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">📝 To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">⚡ In Progress</SelectItem>
                <SelectItem value="COMPLETED">✅ Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Task
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

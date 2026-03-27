import mongoose, { Schema, Document, Model } from "mongoose";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String },
    status: { type: String, enum: ["TODO", "IN_PROGRESS", "COMPLETED"], default: "TODO" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

TaskSchema.index({ status: 1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;

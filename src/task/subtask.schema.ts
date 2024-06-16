import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

import { Task } from "./task.schema";
import { Category } from "../category/category.schema";
import { User } from "../user/user.schema";

export type SubtaskDocument = HydratedDocument<Subtask>;

@Schema()
export class Subtask {
  @Prop()
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }] })
  categories: Category[];

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ default: null })
  dateOfCompletion: null | Date;

  @Prop({ default: null })
  links: Array<string>;

  @Prop({ default: null })
  deadline: null | Date;

  @Prop({ default: false })
  rejected: boolean;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Task" })
  taskId: Task;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  assigneeId: User | Types.ObjectId;

  @Prop({ required: true })
  isConfirmed: boolean;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  updatedAt: Date;
}

export const SubtaskSchema = SchemaFactory.createForClass(Subtask);

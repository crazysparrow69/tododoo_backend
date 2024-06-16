import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Subtask } from "./subtask.schema";
import { Category } from "../category/category.schema";
import { User } from "../user/user.schema";

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
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

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subtask" }] })
  subtasks: Subtask[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

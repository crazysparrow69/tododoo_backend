import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Category } from "src/category/category.schema";
import { AbstractDocument } from "src/database";
import { User } from "src/user/user.schema";

import { Subtask } from "./subtask.schema";

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ default: false, type: Boolean })
  isCompleted: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    default: [],
  })
  categories: Category[];

  @Prop({ type: [String], default: [] })
  links: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subtask" }],
    default: [],
  })
  subtasks: Subtask[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;

  @Prop({ type: Date })
  dateOfCompletion: Date;

  @Prop({ type: Date })
  deadline: Date;

  @Prop({ default: Date.now, type: Date })
  createdAt: Date;

  @Prop({ default: Date.now, type: Date })
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

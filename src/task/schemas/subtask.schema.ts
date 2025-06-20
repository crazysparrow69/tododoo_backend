import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Task } from "./task.schema";
import { AbstractDocument } from "../..//database";
import { Category } from "../../category/category.schema";
import { User } from "../../user/user.schema";

export type SubtaskDocument = HydratedDocument<Subtask>;

@Schema()
export class Subtask extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ default: false, type: Boolean })
  isCompleted: boolean;

  @Prop({ required: true, type: Boolean })
  isConfirmed: boolean;

  @Prop({ default: false, type: Boolean })
  isRejected: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    default: [],
  })
  categories: Category[];

  @Prop({ type: [String], default: [] })
  links: string[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Task" })
  taskId: Task;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  assigneeId: User;

  @Prop({ type: Date })
  dateOfCompletion: Date;

  @Prop({ type: Date })
  deadline: Date;
}

export const SubtaskSchema = SchemaFactory.createForClass(Subtask);

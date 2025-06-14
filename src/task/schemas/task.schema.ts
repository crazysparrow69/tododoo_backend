import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Subtask } from "./subtask.schema";
import { Category } from "../../category/category.schema";
import { AbstractDocument } from "../../database";
import { User } from "../../user/user.schema";

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
}

export const TaskSchema = SchemaFactory.createForClass(Task);

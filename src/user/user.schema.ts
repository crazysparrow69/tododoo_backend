import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { AbstractDocument } from "src/database";

import { Avatar } from "./user.interface";
import { Category } from "../category/category.schema";
import { Task } from "../task/task.schema";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends AbstractDocument {
  @Prop({ required: true, index: true, type: String })
  username: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, unique: true, index: true, type: String })
  email: string;

  @Prop({
    required: false,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  })
  tasks: Task[];

  @Prop({
    required: false,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  })
  categories: Category[];

  @Prop({ default: null, type: Object })
  avatar: Avatar;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

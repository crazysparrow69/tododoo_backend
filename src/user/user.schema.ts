import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Category } from "../category/category.schema";
import { Task } from "../task/task.schema";
import { Avatar } from "./user.interface";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
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

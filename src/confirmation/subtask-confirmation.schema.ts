import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { Subtask } from "src/task/schemas";

import { User } from "../user/user.schema";

export type SubtaskDocument = HydratedDocument<SubtaskConfirmation>;

@Schema()
export class SubtaskConfirmation {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: User | Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  assigneeId: User | Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: "Subtask" })
  subtaskId: Subtask | Types.ObjectId;

  @Prop({ default: "subtask-confirmation" })
  type: string;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  updatedAt: Date;
}

export const SubtaskConfirmationSchema =
  SchemaFactory.createForClass(SubtaskConfirmation);

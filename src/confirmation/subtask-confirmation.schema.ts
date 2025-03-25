import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

import { Subtask } from "../task/schemas";
import { User } from "../user/user.schema";
import { AbstractDocument } from "src/database";

export type SubtaskDocument = HydratedDocument<SubtaskConfirmation>;

@Schema()
export class SubtaskConfirmation extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: User | Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  assigneeId: User | Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: "Subtask" })
  subtaskId: Subtask | Types.ObjectId;

  @Prop({ default: "subtask-confirmation" })
  type: string;
}

export const SubtaskConfirmationSchema =
  SchemaFactory.createForClass(SubtaskConfirmation);

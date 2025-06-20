import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { NotificationTypes } from "./types";
import { AbstractDocument } from "../database";
import { Subtask } from "../task/schemas";
import { User } from "../user/user.schema";

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification extends AbstractDocument {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  actionByUserId: User;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(NotificationTypes),
  })
  type: NotificationTypes;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subtask",
  })
  subtaskId: Subtask;

  @Prop({ required: true, type: Boolean, default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

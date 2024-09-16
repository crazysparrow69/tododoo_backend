import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { AbstractDocument } from "src/database";

import { User } from "../user/user.schema";

export type SessionDocument = HydratedDocument<Session>;

@Schema()
export class Session extends AbstractDocument {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;

  @Prop({ required: true, index: true, type: String })
  token: boolean;

  @Prop({ required: false, type: Boolean, default: true })
  isValid: boolean;

  @Prop({
    required: false,
    type: Date,
    default: () => {
      const now = new Date();
      now.setMonth(now.getMonth() + 1);
      return now;
    },
  })
  expiresAt: Date;

  @Prop({ required: false, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: false, type: Date, default: Date.now })
  updatedAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

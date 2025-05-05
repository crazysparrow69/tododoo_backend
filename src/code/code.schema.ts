import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { AbstractDocument } from "../database";
import { User } from "../user/user.schema";

export type CodeDocument = HydratedDocument<Code>;

export enum CodeTypes {
  EMAIL_VERIFICATION = "email-verification",
}

@Schema()
export class Code extends AbstractDocument {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;

  @Prop({ required: true, type: String, unique: true, index: true })
  code: string;

  @Prop({ type: Boolean, default: true })
  isValid: boolean;

  @Prop({ required: true, type: String })
  type: CodeTypes;
}

export const CodeSchema = SchemaFactory.createForClass(Code);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

import { Avatar } from "./user.interface";
import { AbstractDocument } from "../database";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends AbstractDocument {
  @Prop({ required: true, index: true, type: String })
  username: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, unique: true, index: true, type: String })
  email: string;

  @Prop({ type: Object })
  avatar: Avatar;

  @Prop({ type: Boolean, default: false })
  isBanned: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

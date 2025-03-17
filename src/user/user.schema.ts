import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { AbstractDocument } from "../database";
import { ProfileEffect, UserAvatar, UserAvatarEffect } from "../image/schemas";

export type UserDocument = HydratedDocument<User>;

export enum UserRoles {
  USER = "user",
  ADMIN = "admin",
}

@Schema()
export class User extends AbstractDocument {
  @Prop({ required: true, index: true, type: String })
  username: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, unique: true, index: true, type: String })
  email: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserAvatar" })
  avatarId?: UserAvatar;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "ProfileEffect" })
  profileEffectId?: string | ProfileEffect;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserAvatarEffect" })
  avatarEffectId?: string | UserAvatarEffect;

  @Prop({ type: Boolean, default: false })
  isBanned: boolean;

  @Prop({ type: Array, default: [UserRoles.USER] })
  roles: UserRoles[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

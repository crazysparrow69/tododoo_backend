import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { User } from "../../user/user.schema";
import { AbstractDocument } from "../../database";

@Schema()
export class UserAvatar extends AbstractDocument {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;

  @Prop({ required: true, type: String })
  url: string;

  @Prop({ required: true, type: String })
  public_id: string;
}

export const UserAvatarSchema = SchemaFactory.createForClass(UserAvatar);

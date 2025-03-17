import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { AbstractDocument } from "../../database";
import { CloudinaryMedia } from "../interfaces/cloudinary";

@Schema()
export class UserAvatarEffect extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: Object })
  preview: CloudinaryMedia;

  @Prop({ required: true, type: Object })
  animated: CloudinaryMedia;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserAvatarEffectSchema =
  SchemaFactory.createForClass(UserAvatarEffect);

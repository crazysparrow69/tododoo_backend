import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { AbstractDocument } from "../../database";
import { CloudinaryMedia } from "../interfaces/cloudinary";

@Schema()
export class ProfileEffect extends AbstractDocument {
  @Prop({ required: false, type: Object })
  intro: CloudinaryMedia;

  @Prop({ required: true, type: Object })
  preview: CloudinaryMedia;

  @Prop({ required: true, type: Object })
  sides: CloudinaryMedia;

  @Prop({ required: false, type: Object })
  top: CloudinaryMedia;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(ProfileEffect);

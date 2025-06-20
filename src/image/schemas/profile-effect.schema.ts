import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { AbstractDocument } from "../../database";
import { CloudinaryMedia } from "../interfaces/cloudinary";

@Schema()
export class ProfileEffect extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: Object })
  intro?: CloudinaryMedia;

  @Prop({ required: true, type: Object })
  preview: CloudinaryMedia;

  @Prop({ required: true, type: Object })
  sides: CloudinaryMedia;

  @Prop({ type: Object })
  top?: CloudinaryMedia;
}

export const ProfileEffectSchema = SchemaFactory.createForClass(ProfileEffect);

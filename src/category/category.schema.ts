import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, now } from "mongoose";

import { AbstractDocument } from "../database";
import { User } from "../user/user.schema";

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  color: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

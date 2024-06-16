import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { User } from "../user/user.schema";

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  @Prop()
  title: string;

  @Prop()
  color: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

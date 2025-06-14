import { Prop, Schema } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema({ timestamps: true })
export class AbstractDocument {
  @Prop({ auto: true, type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

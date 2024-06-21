import { Prop, Schema } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema()
export class AbstractDocument {
  @Prop({ auto: true, type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;
}

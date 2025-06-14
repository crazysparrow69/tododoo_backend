import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

import { AbstractDocument } from "../database";
import { User } from "src/user/user.schema";

export type BoardTagDocument = HydratedDocument<BoardTag>;

@Schema()
export class BoardTag extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  color: string;
}

export const BoardTagSchema = SchemaFactory.createForClass(BoardTag);

@Schema()
export class BoardTask extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  })
  assigneeIds: User[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    default: [],
  })
  tagIds: BoardTag[];

  @Prop({ required: true, type: Number })
  order: number;
}

export const BoardTaskSchema = SchemaFactory.createForClass(BoardTask);

@Schema()
export class BoardColumn extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: Number })
  order: number;

  @Prop({ type: [BoardTaskSchema], default: [] })
  tasks: Types.DocumentArray<BoardTask>;
}

export const BoardColumnSchema = SchemaFactory.createForClass(BoardColumn);

export type BoardDocument = HydratedDocument<Board>;

@Schema()
export class Board extends AbstractDocument {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  userId: User;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  })
  userIds: User[];

  @Prop({ type: [BoardColumnSchema], default: [] })
  columns: Types.DocumentArray<BoardColumn>;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    default: [],
  })
  tagIds: BoardTag[];
}

export const BoardSchema = SchemaFactory.createForClass(Board);

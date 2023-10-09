import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';

import { Category } from 'src/category/category.schema';
import { Task } from 'src/task/task.schema';
import { Avatar } from 'src/image/avatar.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    required: false,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  })
  tasks: Task[];

  @Prop({
    required: false,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  })
  categories: Category[];

  @Prop({
    default: null,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Avatar',
  })
  avatar: Avatar;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

import { User } from '../user/user.schema';
import { Subtask } from 'src/task/subtask.schema';

export type SubtaskDocument = HydratedDocument<SubtaskConfirmation>;

@Schema()
export class SubtaskConfirmation {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  addresseeId: User;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Subtask' })
  subtaskId: Subtask;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: mongoose.Schema.Types.Date, default: Date.now })
  updatedAt: Date;
}

export const SubtaskConfirmationSchema =
  SchemaFactory.createForClass(SubtaskConfirmation);
import { Types } from 'mongoose';

export interface UserConnection {
  userId: Types.ObjectId;
  socketId: string;
}

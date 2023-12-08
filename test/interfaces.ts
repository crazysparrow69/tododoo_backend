import { Types } from 'mongoose';
import { Avatar } from '../src/user/user.schema';

interface User {
  _id: Types.ObjectId;
  username: string;
  password: string;
  email: string;
  tasks: Task[];
  categories: Category[];
  avatar: Avatar;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  _id: Types.ObjectId;
  title: string;
  color: string;
  userId: Types.ObjectId;
}

interface Task {
  _id: Types.ObjectId;
  title: string;
  description: string;
  categories: Category[];
  isCompleted: boolean;
  dateOfCompletion: null | Date;
  links: Array<string>;
  deadline: null | Date;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface Subtask {
  _id: Types.ObjectId;
  title: string;
  description: string;
  categories: Category[];
  isCompleted: boolean;
  dateOfCompletion: null | Date;
  links: Array<string>;
  deadline: null | Date;
  rejected: boolean;
  userId: Types.ObjectId;
  taskId: Types.ObjectId;
  assigneeId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export { User, Category, Task, Subtask };

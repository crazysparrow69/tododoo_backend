import { Types } from 'mongoose';

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

export { Category, Task };

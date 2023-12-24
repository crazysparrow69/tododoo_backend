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

const taskControllerDatasets = [
  {
    message: 'empty title',
    data: {
      description: 'description',
      categories: [],
      isCompleted: true,
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: 123,
    },
  },
  {
    message: 'too short title',
    data: {
      title: 'a',
      description: 'description',
      categories: [],
      isCompleted: true,
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: 123,
    },
  },
  {
    message: 'too long title',
    data: {
      title: 'sportsportsportsportsportsportsportsportsportsport!',
      description: 'description',
      categories: [],
      isCompleted: true,
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: 123,
    },
  },
  {
    message: 'invalid type of title',
    data: {
      title: 123,
      description: 'description',
      categories: [],
      isCompleted: true,
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: 123,
    },
  },
  {
    message: 'empty description',
    data: {
      title: 'task',
      categories: [],
      isCompleted: true,
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: 123,
    },
  },
  {
    message: 'too short description',
    data: {
      title: 'task',
      description: 'a',
      categories: [],
      isCompleted: true,
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: 123,
    },
  },
  {
    message: 'invalid type of description',
    data: {
      title: 'task',
      description: 123,
      categories: [],
      isCompleted: true,
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: 123,
    },
  },
  {
    message: 'invalid type of categories',
    data: {
      title: 'task',
      description: 'description',
      categories: 'niggers',
      isCompleted: true,
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: 123,
    },
  },
  {
    message: 'invalid type of isCompleted',
    data: {
      title: 'task',
      description: 'description',
      categories: [],
      isCompleted: 'yes',
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: 123,
    },
  },
  {
    message: 'invalid type of assigneeId',
    data: {
      title: 'task',
      description: 'description',
      categories: [],
      isCompleted: 'yes',
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: '123',
    },
  },
  {
    message: 'invalid type of links',
    data: {
      title: 'task',
      description: 'description',
      categories: [],
      isCompleted: true,
      dateOfCompletion: null,
      links: 'https://www.instagram.com/ivan_anenko/',
      deadline: null,
      assigneeId: 123,
    },
  },
  {
    message: 'invalid type of deadline',
    data: {
      title: 'task',
      description: 'description',
      categories: [],
      isCompleted: true,
      dateOfCompletion: null,
      links: [],
      deadline: 'yesterday',
      assigneeId: 123,
    },
  },
];

export { User, Category, Task, Subtask, taskControllerDatasets };

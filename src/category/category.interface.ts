import { User } from "../user/user.schema";

export interface createdCategoryDoc {
  __v: string;
  title: string;
  color: string;
  userId: User;
}

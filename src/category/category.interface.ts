import { User } from "../user/user.schema";

export interface createdCategoryDoc {
  title: string;
  color: string;
  userId: User;
}

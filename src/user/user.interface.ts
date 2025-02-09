import { User } from "./user.schema";

export interface findUsersByUsername {
  foundUsers: User[];
  page: number;
  totalPages: number;
}

import { User } from "./user.schema";

export interface Avatar {
  url: string;
  public_id: string;
}

export interface findUsersByUsername {
  foundUsers: User[];
  page: number;
  totalPages: number;
}

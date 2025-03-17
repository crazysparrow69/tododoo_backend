import { UserRoles } from "../../../user/user.schema";

import { UserBaseDto } from "./user-base.dto";

export class UserProfileDto extends UserBaseDto {
  email: string;
  createdAt: Date;
  roles: UserRoles[];
}

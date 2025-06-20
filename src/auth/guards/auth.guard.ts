import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";

import { User } from "../../user/user.schema";
import { Session } from "../session.schema";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Session.name)
    private sessionModel: Model<Session>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    try {
      const foundToken = await this.sessionModel.findOne({ token });
      const now = new Date();
      if (!foundToken || !foundToken.isValid || foundToken.expiresAt < now)
        throw new UnauthorizedException();

      const foundUser = await this.userModel.findById(foundToken.userId);
      if (!foundUser) throw new UnauthorizedException();

      request.user = { sub: foundToken.userId, isBanned: foundUser.isBanned };
    } catch (err: any) {
      throw new UnauthorizedException(err.message);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

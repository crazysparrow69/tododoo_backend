import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class BannedUserGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.isBanned) {
      throw new UnauthorizedException("User is banned");
    }

    return true;
  }
}

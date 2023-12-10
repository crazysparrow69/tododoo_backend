import { InjectModel } from '@nestjs/mongoose';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';

import { User } from '../../user/user.schema';

@Injectable()
export class WebsocketGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const { token } = client.handshake.query;
    console.log('shit');
    if (!token) throw new WsException('Unauthorized');

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      payload.sub = new Types.ObjectId(payload.sub);

      const foundUser = await this.userModel.findById(payload.sub);
      if (!foundUser) throw new WsException('Unauthorized');

      client.userId = foundUser._id;
    } catch (err) {
      throw new WsException(err.message);
    }

    return true;
  }
}

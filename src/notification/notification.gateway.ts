import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { User } from 'src/user/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface FindAndDeleteUserConnection {
  userId: string;
  socketId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @WebSocketServer() io: Namespace;

  private connections = [];

  // handleConnection(client: any) {
  //   try {
  //     const { token } = client.handshake.query;
  //     if (!token) {
  //       throw new WsException('Unauthorized');
  //     }
  //     const userId = this.validateToken(token);
  //     this.connections.push({
  //       userId,
  //       socketId: client.id,
  //     });
  //     console.log(`User ${userId} connected to notifications`);
  //   } catch (err) {
  //     client.emit('error', err.message);
  //     return false;
  //   }
  // }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers['token'];
      if (!token) {
        throw new WsException('Unauthorized');
      }
      const userId = await this.validateToken(token as string);

      const sockets = this.io.sockets;
      this.io.emit('hello', client.id);

      console.log(`User with id ${userId} connected`);
      console.log(`Number of connected sockets: ${sockets.size}`);
    } catch (err) {
      client.emit('errorServer', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    const sockets = this.io.sockets;

    console.log(`User with id ${client.id} disconnected`);
    console.log(`Number of connected sockets: ${sockets.size}`);
  }

  // handleDisconnect(client: any) {
  //   const connection = this.findAndDeleteUserConnection(client.id);
  //   if (connection) {
  //     console.log(`User ${connection.userId} disconnected from notifications`);
  //   }
  // }

  @SubscribeMessage('test')
  async handleMessage() {
    console.log('shit');
    new WsException('shit');
  }

  private findAndDeleteUserConnection(
    socketId: string,
  ): FindAndDeleteUserConnection | null {
    const connectionIndex = this.connections.findIndex(
      (el) => el.socketId === socketId,
    );

    if (connectionIndex === -1) {
      return null;
    } else {
      const connection = this.connections[connectionIndex];
      this.connections.splice(connectionIndex, 1);
      console.log(connection);
      return connection;
    }
  }

  private async validateToken(token: string): Promise<Types.ObjectId> {
    if (!token) throw new WsException('Unauthorized');

    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    payload.sub = new Types.ObjectId(payload.sub);

    const foundUser = await this.userModel.findById(payload.sub);
    if (!foundUser) throw new WsException('Unauthorized');

    return foundUser._id;
  }
}

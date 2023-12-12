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

import { SubtaskConfirmService } from 'src/confirmation/subtask-confirmation.service';
import { CreateSubtaskConfirmationDto } from 'src/confirmation/dtos/create-subtask-confirmation.dto';

interface UserConnection {
  userId: Types.ObjectId;
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
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private subtaskConfirmService: SubtaskConfirmService,
  ) {}

  @WebSocketServer() io: Namespace;

  private connections = [];

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers['token'];
      if (!token) {
        throw new WsException('Unauthorized');
      }
      const userId = await this.validateToken(token as string);
      this.addUserConnection(userId, client.id);

      const sockets = this.io.sockets;
      console.log(`User with id ${userId} connected`);
      console.log(`Number of connected sockets: ${sockets.size}`);
      console.log(this.connections);
    } catch (err) {
      client.emit('errorServer', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const conn = this.findAndDeleteUserConnection(client.id);
    const sockets = this.io.sockets;

    console.log(`User with id ${conn.userId} disconnected`);
    console.log(`Number of connected sockets: ${sockets.size}`);
    console.log(this.connections);
  }

  async handleCreateSubtaskConf(
    dto: CreateSubtaskConfirmationDto,
    userId: string,
  ) {
    const createdSubtConf =
      await this.subtaskConfirmService.createSubtaskConfirmation(userId, dto);

    const socketId = this.findConnectionByUserId(dto.assigneeId);
    if (socketId) {
      this.io.to(socketId).emit('newSubtaskConfirmation', createdSubtConf);
    }
  }

  async handleDeleteSubtaskConf(userId: string, subtaskId: string) {
    const deletedSubtConf =
      await this.subtaskConfirmService.removeSubtaskConfirmation(
        userId,
        subtaskId,
      );

    const socketId = this.findConnectionByUserId(
      deletedSubtConf.assigneeId.toString(),
    );
    if (socketId) {
      this.io.to(socketId).emit('delSubtaskConfirmation', deletedSubtConf._id);
    }
  }

  private addUserConnection(
    userId: Types.ObjectId,
    socketId: string,
  ): UserConnection | null {
    if (this.connections.some((el) => el.userId === userId)) {
      return null;
    } else {
      const conn = {
        userId,
        socketId,
      };
      this.connections.push(conn);
      return conn;
    }
  }

  private findConnectionByUserId(userId: string): string | null {
    const conn = this.connections.find(
      (el) => el.userId.toString() === userId.toString(),
    );
    return conn ? conn.socketId : null;
  }

  private findAndDeleteUserConnection(socketId: string): UserConnection | null {
    const connectionIndex = this.connections.findIndex(
      (el) => el.socketId === socketId,
    );

    if (connectionIndex === -1) {
      return null;
    } else {
      const connection = this.connections[connectionIndex];
      this.connections.splice(connectionIndex, 1);
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

import { forwardRef, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import mongoose, { Model, Types } from "mongoose";
import { Namespace, Socket } from "socket.io";

import { UserConnection } from "./notification.interface";
import { NotificationService } from "./notification.service";
import {
  NotificationServerEvents,
  NotificationClientEvents,
  NotificationTypes,
} from "./types";
import { SubtaskConfirmService } from "../confirmation/subtask-confirmation.service";
import { SubtaskService } from "../task/subtask.service";
import { User } from "../user/user.schema";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: "/notifications",
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly subtConfService: SubtaskConfirmService,
    private readonly subtaskService: SubtaskService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService
  ) {}

  @WebSocketServer() io: Namespace;

  private connections = [];

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.headers["token"];
      if (!token) {
        throw new WsException("Unauthorized");
      }
      const userId = await this.validateToken(token as string);
      this.addUserConnection(userId, client.id);

      const sockets = this.io.sockets;
      console.log(`User with id ${userId} connected`);
      console.log(`Number of connected sockets: ${sockets.size}`);
      console.log(this.connections);
    } catch (err: any) {
      client.emit(NotificationServerEvents.ERROR, err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const conn = this.findAndDeleteUserConnection(client.id);
    const sockets = this.io.sockets;

    console.log(`User with id ${conn.userId} disconnected`);
    console.log(`Number of connected sockets: ${sockets.size}`);
    console.log(this.connections);
  }

  @SubscribeMessage(NotificationClientEvents.SUBTASK_CONFIRM)
  async handleSubtaskConfirmation(
    client: Socket,
    { subtaskId, receiverId }: { subtaskId: string; receiverId: string }
  ): Promise<void> {
    const userId = this.findUserIdByConnection(client.id);
    await this.subtConfService.removeSubtaskConfirmation(subtaskId);
    await this.subtaskService.updateSubtaskIsConf(userId, subtaskId, true);
    const notification = await this.notificationService.create({
      actionByUserId: userId,
      userId: new Types.ObjectId(receiverId),
      subtaskId: new Types.ObjectId(subtaskId),
      type: NotificationTypes.SUBTASK_CONFIRMED,
    });
    this.io
      .to(this.findConnectionByUserId(receiverId))
      .emit(NotificationServerEvents.NEW_NOTIFICATION, notification);
  }

  @SubscribeMessage(NotificationClientEvents.SUBTASK_REJECT)
  async handleSubtaskRejection(
    client: Socket,
    { subtaskId, receiverId }: { subtaskId: string; receiverId: string }
  ): Promise<void> {
    const userId = this.findUserIdByConnection(client.id);
    await this.subtConfService.removeSubtaskConfirmation(subtaskId);
    await this.subtaskService.updateSubtaskIsConf(userId, subtaskId, false);
    const notification = await this.notificationService.create({
      actionByUserId: userId,
      userId: new mongoose.Types.ObjectId(receiverId),
      subtaskId: new Types.ObjectId(subtaskId),
      type: NotificationTypes.SUBTASK_REJECTED,
    });
    this.io
      .to(this.findConnectionByUserId(receiverId))
      .emit(NotificationServerEvents.NEW_NOTIFICATION, notification);
  }

  private addUserConnection(
    userId: Types.ObjectId,
    socketId: string
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

  public findConnectionByUserId(
    userId: string | Types.ObjectId
  ): string | null {
    const conn = this.connections.find(
      (el) => el.userId.toString() === userId.toString()
    );
    return conn ? conn.socketId : null;
  }

  private findUserIdByConnection(socketId: string): Types.ObjectId | null {
    const conn = this.connections.find((el) => el.socketId === socketId);
    return conn ? conn.userId : null;
  }

  private findAndDeleteUserConnection(socketId: string): UserConnection | null {
    const connectionIndex = this.connections.findIndex(
      (el) => el.socketId === socketId
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
    if (!token) throw new WsException("Unauthorized");

    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get("ACCESS_TOKEN_SECRET"),
    });

    payload.sub = new Types.ObjectId(payload.sub);

    const foundUser = await this.userModel.findById(payload.sub);
    if (!foundUser) throw new WsException("Unauthorized");

    return foundUser._id;
  }
}

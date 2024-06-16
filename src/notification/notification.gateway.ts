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
import { Model, Types } from "mongoose";
import { Namespace, Socket } from "socket.io";

import { SubtaskConfirmService } from "../confirmation/subtask-confirmation.service";
import { TaskService } from "../task/task.service";
import { User } from "../user/user.schema";
import { UserConnection } from "./notification.interface";

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
    private jwtService: JwtService,
    private subtConfService: SubtaskConfirmService,
    private taskService: TaskService
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
    } catch (err) {
      client.emit("errorServer", err.message);
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

  @SubscribeMessage("subtask:confirm")
  async handleSubtaskConfirmation(
    client: Socket,
    subtaskId: string
  ): Promise<void> {
    const userId = this.findUserIdByConnection(client.id);
    await this.subtConfService.removeSubtaskConfirmation(subtaskId);
    await this.taskService.updateSubtaskIsConf(userId, subtaskId, true);
  }

  @SubscribeMessage("subtask:reject")
  async handleSubtaskRejection(
    client: Socket,
    subtaskId: string
  ): Promise<void> {
    const userId = this.findUserIdByConnection(client.id);
    await this.subtConfService.removeSubtaskConfirmation(subtaskId);
    await this.taskService.updateSubtaskIsConf(userId, subtaskId, false);
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
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    payload.sub = new Types.ObjectId(payload.sub);

    const foundUser = await this.userModel.findById(payload.sub);
    if (!foundUser) throw new WsException("Unauthorized");

    return foundUser._id;
  }
}

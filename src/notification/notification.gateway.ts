import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WebsocketGuard } from 'src/auth/guards/websocket.guard';

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
  constructor() {}

  @WebSocketServer() wss: Server;

  private connections = [];

  @UseGuards(WebsocketGuard)
  handleConnection(client: any) {
    const { userId } = client.handshake.query;
    this.connections.push({
      userId,
      socketId: client.id,
    });
    console.log(`User ${userId} connected to notifications`);
  }

  handleDisconnect(client: any) {
    const { userId } = this.findAndDeleteUserConnection(client.id);
    if (userId) {
      console.log(`User ${userId} disconnected from notifications`);
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
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
      return connection;
    }
  }
}

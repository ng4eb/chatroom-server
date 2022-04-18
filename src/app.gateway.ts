import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import {
  Logger,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  ChatMessageResponseDto,
  ReadMessageDto,
  SendMessageDto,
} from './chat/chat.dto';
import { ChatService } from './chat/chat.service';
import { WsGuard } from './utils/ws.guard';
import { BadRequestTransformationFilter } from './utils/bad-request-transformation.filter';
import { WsInterceptor } from './utils/ws.interceptor';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private chatService: ChatService) {}
  @WebSocketServer() public server: Server;
  private logger: Logger = new Logger('AppGateway');

  @UsePipes(new ValidationPipe())
  @UseFilters(new BadRequestTransformationFilter())
  @UseGuards(WsGuard)
  @UseInterceptors(WsInterceptor)
  @SubscribeMessage('msgToServer')
  async handleMessage(client: Socket, payload: SendMessageDto) {
    this.logger.log({ payload });
    const { senderId, receiverId, content, repliedId } = payload as any;
    const message = {
      content,
      repliedId,
    };
    const result = await this.chatService.sendMessageFromIdToId(
      senderId,
      receiverId,
      message,
    );
    const data = new ChatMessageResponseDto(result);
    /*
     !WARNING!
     Below settings are not safe at all - only for demo purposes
     Instead of using the original user and chatroom ids
     A safer approach would be to store a set of connection ids
     As event identifiers for each active user and chatroom
    */
    this.server.emit(`msgToClient-user-${senderId}`, data);
    this.server.emit(`msgToClient-user-${receiverId}`, data);
    this.server.emit(`msgToClient-chatroom-${result.chatroom_id}`, data);
  }

  @UsePipes(new ValidationPipe())
  @UseFilters(new BadRequestTransformationFilter())
  @UseGuards(WsGuard)
  @UseInterceptors(WsInterceptor)
  @SubscribeMessage('readToServer')
  async handleRead(client: Socket, payload: ReadMessageDto) {
    this.logger.log({ payload });
    const { senderId, chatroomId } = payload as any;
    await this.chatService.updateChatsToReadByChatRoomId(senderId, chatroomId);
    /*
     !WARNING!
     Below settings are not safe at all - only for demo purposes
     Instead of using the original user and chatroom ids
     A safer approach would be to store a set of connection ids
     As event identifiers for each active user and chatroom
    */
    this.server.emit(`readToClient-user-${senderId}`, {
      chatroomId,
    });
    this.server.emit(`readToClient-chatroom-${chatroomId}`, {
      senderId,
    });
  }

  afterInit(server: Server) {
    /* do some work here on init if needed */
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}

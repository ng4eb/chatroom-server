import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/user.decorator';
import { SendMessageDto } from './chat.dto';

@Controller('chat')
@UseGuards(AuthGuard())
export class ChatController {
  constructor(private chatService: ChatService) {}
  @Get()
  getChats(@User() user: any) {
    return this.chatService.getChatsByUserId(user.id);
  }

  @Get(':id')
  getChatsWithAnotherUserId(@User() user: any, @Param('id') id: number) {
    return this.chatService.getChatsBewteenTwoUserIds(user.id, id);
  }

  @Post(':id')
  sendMessageToAnotherUserId(
    @User() user: any,
    @Param('id') id: number,
    @Body() message: SendMessageDto,
  ) {
    return this.chatService.sendMessageFromIdToId(user.id, id, message);
  }
}

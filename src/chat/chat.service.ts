import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatMessageResponseDto, SendMessageDto } from './chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getChatsByUserId(id: number) {
    const chatRooms = await this.prisma.chatRoom.findMany({
      where: {
        users: {
          some: {
            id,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
          },
        },
        chatroom_messages: {
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
          select: {
            sender: {
              select: {
                id: true,
              },
            },
            content: true,
          },
        },
      },
    });
    return chatRooms.map((room) => ({
      id: room.id,
      users: [...room.users],
      messages: [...room.chatroom_messages],
    }));
  }

  async getChatsBewteenTwoUserIds(userId: number, anotherUserId: number) {
    await this.validateConversationBetweenTwoIds(userId, anotherUserId);
    const chatRoom = await this.prisma.chatRoom.findFirst({
      where: {
        AND: [
          { users: { some: { id: userId } } },
          { users: { some: { id: anotherUserId } } },
        ],
      },
      include: {
        chatroom_messages: {
          select: {
            id: true,
            sender_id: true,
            replied_id: true,
            content: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });
    if (!chatRoom)
      throw new HttpException(
        `No conversation found with user ${anotherUserId}`,
        400,
      );
    return {
      messages: chatRoom.chatroom_messages.map(
        (msg) => new ChatMessageResponseDto(msg),
      ),
    };
  }

  async sendMessageFromIdToId(
    fromId: number,
    toId: number,
    message: SendMessageDto,
  ) {
    await this.validateConversationBetweenTwoIds(fromId, toId);
    let chatRoom = await this.prisma.chatRoom.findFirst({
      where: {
        AND: [
          { users: { some: { id: fromId } } },
          { users: { some: { id: toId } } },
        ],
      },
      select: {
        id: true,
      },
    });
    if (!chatRoom) {
      // Create a new chatroom between two users
      console.log('Creating a new chat room');
      chatRoom = await this.createChatRoomBetweenTwoUsers(fromId, toId);
      console.log({ chatRoom });
    }
    const data = {
      chatroom_id: chatRoom.id,
      sender_id: fromId,
      content: message.content,
    };
    if (message.repliedId) {
      Object.assign(data, { replied_id: message.repliedId });
    }
    const newMessage = await this.prisma.chatMessage.create({
      data,
    });
    return newMessage;
  }

  private async validateConversationBetweenTwoIds(
    fromId: number,
    toId: number,
  ) {
    if (fromId === toId) throw new HttpException('No self-conversation', 400);
    const anotherUser = await this.prisma.user.findUnique({
      where: {
        id: toId,
      },
    });
    if (!anotherUser) throw new HttpException('User not found', 400);
  }

  private createChatRoomBetweenTwoUsers(id1: number, id2: number) {
    return this.prisma.chatRoom.create({
      data: {
        users: {
          connect: [
            {
              id: id1,
            },
            {
              id: id2,
            },
          ],
        },
      },
    });
  }
}

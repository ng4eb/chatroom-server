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
    const unreadMessageCount = [];
    for (const room of chatRooms) {
      const count = await this.prisma.chatMessage.count({
        where: {
          is_read: false,
          chatroom_id: room.id,
          NOT: {
            sender_id: id,
          },
        },
      });
      unreadMessageCount.push(count);
    }
    return chatRooms.map((room, i) => ({
      id: room.id,
      users: [...room.users],
      messages: [...room.chatroom_messages],
      unreadMessageCount: unreadMessageCount[i],
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
      chatRoom = await this.createChatRoomBetweenTwoUsers(fromId, toId);
    }
    const data = {
      chatroom_id: chatRoom.id,
      sender_id: fromId,
      content: message.content,
    };
    if (message.repliedId) {
      Object.assign(data, { replied_id: message.repliedId });
    }
    return await this.prisma.chatMessage.create({
      data,
    });
  }

  async updateChatsToReadByChatRoomId(readerId: number, chatRoomId: string) {
    await this.prisma.chatMessage.updateMany({
      where: {
        NOT: {
          sender_id: readerId,
        },
        chatroom: {
          id: chatRoomId,
          users: {
            some: {
              id: readerId,
            },
          },
        },
      },
      data: {
        is_read: true,
      },
    });
    return 'okay';
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

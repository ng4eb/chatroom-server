import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException } from '@nestjs/common';

const mockGetChats = [
  {
    id: '0b2c2624-1aca-4696-b979-e3fbbc3bf7cd',
    users: [
      {
        id: 1,
        username: 'demouser',
      },
      {
        id: 2,
        username: 'demouser2',
      },
    ],
    chatroom_messages: [
      {
        sender: {
          id: 1,
        },
        content: 'Another Test Message!',
      },
    ],
  },
];

const mockGetChatsBetween = {
  id: '0b2c2624-1aca-4696-b979-e3fbbc3bf7cd',
  chatroom_messages: [
    {
      id: 'be643d84-9031-4135-9ca6-4f8d4ac78fe8',
      content: 'Test Message!',
      senderId: 1,
      repliedId: null,
      createdAt: '2022-04-17T05:21:12.572Z',
    },
    {
      id: '92f21928-8eb6-4fb8-8357-be2baf7ba675',
      content: 'Another Test Message!',
      senderId: 1,
      repliedId: null,
      createdAt: '2022-04-17T05:21:53.075Z',
    },
  ],
};

const mockGetUser = {
  id: 2,
  username: 'demouser2',
  password: 'hashed',
  email: 'demo@demo.com',
  phone: '123456543',
  gender: 'MALE',
  craeted_at: '2022-04-17T04:26:28.208Z',
  updated_at: '2022-04-17T04:26:28.212Z',
};

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: {
            chatRoom: {
              findMany: jest.fn().mockReturnValue(mockGetChats),
              findFirst: jest.fn().mockReturnValue(null),
            },
            chatMessage: {
              updateMany: jest.fn().mockReturnValue(null),
              count: jest.fn().mockReturnValue(null),
            },
            user: {
              findUnique: jest.fn().mockReturnValue(mockGetUser),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getChatsByUserId', () => {
    it('should call prisma findMany with correct where clause', async () => {
      const mockPrismaFindManyChats = jest.fn().mockReturnValue(mockGetChats);

      const whereClause = {
        users: {
          some: {
            id: 1,
          },
        },
      };

      jest
        .spyOn(prisma.chatRoom, 'findMany')
        .mockImplementation(mockPrismaFindManyChats);

      await service.getChatsByUserId(1);

      expect(mockPrismaFindManyChats).toBeCalledWith({
        where: whereClause,
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
    });
  });

  describe('getChatsBetweenTwoUserIds', () => {
    it('should throw error if two user ids are the same', () => {
      expect(service.getChatsBewteenTwoUserIds(1, 1)).rejects.toThrowError(
        HttpException,
      );
    });

    it('should throw error if chatroom is not found', () => {
      expect(service.getChatsBewteenTwoUserIds(1, 2)).rejects.toThrowError(
        HttpException,
      );
    });

    it('should call findFirst with correct params', async () => {
      const mockPrismaFindFirstChatRoom = jest
        .fn()
        .mockReturnValue(mockGetChatsBetween);
      const whereClause = {
        AND: [{ users: { some: { id: 1 } } }, { users: { some: { id: 2 } } }],
      };
      jest
        .spyOn(prisma.chatRoom, 'findFirst')
        .mockImplementation(mockPrismaFindFirstChatRoom);
      await service.getChatsBewteenTwoUserIds(1, 2);
      expect(mockPrismaFindFirstChatRoom).toBeCalledWith({
        where: whereClause,
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
    });
  });

  describe('updateChatsToRead', () => {
    it('should call update with correct params', async () => {
      const mockPrismaUpdateChats = jest.fn().mockReturnValue(null);
      const whereClause = {
        NOT: {
          sender_id: 1,
        },
        chatroom: {
          id: 'testing-uuid',
          users: {
            some: {
              id: 1,
            },
          },
        },
      };
      const data = {
        is_read: true,
      };
      jest
        .spyOn(prisma.chatMessage, 'updateMany')
        .mockImplementation(mockPrismaUpdateChats);
      await service.updateChatsToReadByChatRoomId(1, 'testing-uuid');
      expect(mockPrismaUpdateChats).toBeCalledWith({
        where: whereClause,
        data,
      });
    });
  });
});

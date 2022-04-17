import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { GetUsersResponseDto } from './user.dto';

const mockFindManyUsers = [
  {
    id: 1,
    gender: 'MALE',
    username: 'demouser1',
    password: 'secret',
    phone: '92384329343',
    email: 'demo1@demo.com',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    gender: 'MALE',
    username: 'demouser2',
    password: 'secret',
    phone: '98234012482',
    email: 'demo2@demo.com',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn().mockReturnValue(mockFindManyUsers),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getUsers', () => {
    it('findMany should be called with correct params', async () => {
      const mockFindManyUsers = jest.fn().mockReturnValue([]);
      const filter = { gender: 'MALE' };
      jest.spyOn(prisma.user, 'findMany').mockImplementation(mockFindManyUsers);
      await service.getUsers({ gender: 'MALE' });
      expect(mockFindManyUsers).toBeCalledWith({
        where: filter,
      });
    });

    it('findMany should return users in correct format', async () => {
      const expectedResult = mockFindManyUsers.map(
        (data) => new GetUsersResponseDto(data),
      );
      const result = await service.getUsers({});
      expect(result).toStrictEqual(expectedResult);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUsers: jest.fn().mockReturnValue([]),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('getUsers', () => {
    it('should throw error if gender is not MALE or FEMALE', async () => {
      try {
        await controller.getUsers('Gibberish');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should call getUsers with correct filter', async () => {
      const mockGetUsers = jest.fn().mockReturnValue([]);
      jest.spyOn(userService, 'getUsers').mockImplementation(mockGetUsers);
      await controller.getUsers('MALE');

      expect(mockGetUsers).toBeCalledWith({ gender: 'MALE' });
    });
  });
});

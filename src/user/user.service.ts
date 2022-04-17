import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GetUsersResponseDto,
  GetUserResponseDto,
  UpdateProfileDto,
  GetProflieResponseDto,
} from './user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUsers(filter: { gender?: string }): Promise<GetUsersResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: filter,
    });
    return users.map((user) => new GetUsersResponseDto(user));
  }

  async getUserDetailById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return new GetUserResponseDto(user);
  }

  async getProfileById(id: number) {
    const profile = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return new GetProflieResponseDto(profile);
  }

  async updateProfileById(id: number, data: UpdateProfileDto) {
    const { phone, password } = data;
    const toUpdate = {};
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      Object.assign(toUpdate, { password: hashed });
    }
    if (phone) {
      Object.assign(toUpdate, { phone });
    }
    const updatedProfile = await this.prisma.user.update({
      where: {
        id,
      },
      data: toUpdate,
    });
    return new GetProflieResponseDto(updatedProfile);
  }
}

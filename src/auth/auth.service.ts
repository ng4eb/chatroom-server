import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { SignInDto, SignUpDto } from './auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signup(data: SignUpDto) {
    const { email, password, username, phone, gender } = data;
    const userExists = await this.checkUserExists({
      email,
      username,
      phone,
    });
    if (userExists) throw new ConflictException('User already exists');
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        username,
        phone,
        gender,
      },
    });
    return this.generateJwt(username, user.id);
  }

  async signin(data: SignInDto) {
    const { email, password } = data;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw new HttpException('Incorrect credentials', 400);
    const hashedPwd = user.password;
    const matched = await bcrypt.compare(password, hashedPwd);
    if (!matched) throw new HttpException('Incorrect credentials', 400);
    return this.generateJwt(user.username, user.id);
  }

  private async generateJwt(username: string, id: number) {
    const payload: JwtPayload = { username, id };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken };
  }

  private async checkUserExists({
    email,
    phone,
    username,
  }: {
    email: string;
    phone: string;
    username: string;
  }) {
    if (email) {
      const found = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (found) return true;
    }
    if (phone) {
      const found = await this.prisma.user.findUnique({
        where: {
          phone,
        },
      });
      if (found) return true;
    }
    if (username) {
      const found = await this.prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (found) return true;
    }
    return false;
  }
}

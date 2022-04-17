import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Gender } from '../auth/auth.dto';
import { GetUsersResponseDto, UpdateProfileDto } from './user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.decorator';

@Controller('user')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUsers(@Query('gender') gender?: string): Promise<GetUsersResponseDto[]> {
    if (gender && !Object.values(Gender).includes(gender))
      throw new HttpException('Gender must be MALE or FEMALE', 400);
    const filter = { gender };
    return this.userService.getUsers(filter);
  }

  @Get('me')
  getSelfProfile(@User() user: any) {
    return this.userService.getProfileById(user.id);
  }

  @Put('me')
  updateSelfProfile(@User() user: any, @Body() data: UpdateProfileDto) {
    return this.userService.updateProfileById(user.id, data);
  }

  @Get(':id')
  getUserById(@Param('id') id: number): Promise<GetUsersResponseDto> {
    return this.userService.getUserDetailById(id);
  }
}

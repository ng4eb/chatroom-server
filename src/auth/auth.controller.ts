import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto, SignUpDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  signup(@Body() data: SignUpDto) {
    return this.authService.signup(data);
  }

  @Post('signin')
  signin(@Body() data: SignInDto) {
    return this.authService.signin(data);
  }
}

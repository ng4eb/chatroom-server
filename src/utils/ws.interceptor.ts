import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsInterceptor implements NestInterceptor {
  constructor(private userService: UserService, private jwt: JwtService) {}

  async intercept(context: any, next: CallHandler<any>) {
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(' ')[1];
    const decoded = this.jwt.verify(bearerToken) as any;
    const data = context.switchToWs().getData();
    data.senderId = decoded.id;
    return next.handle();
  }
}

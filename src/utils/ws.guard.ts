import { CanActivate, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private userService: UserService, private jwt: JwtService) {}

  async canActivate(context: any) {
    try {
      const bearerToken =
        context.args[0].handshake.headers.authorization.split(' ')[1];
      // const decoded = this.jwt.verify(bearerToken, {
      //   secret: process.env.JWT_KEY,
      // }) as any;
      const decoded = this.jwt.verify(bearerToken) as any;
      return new Promise<boolean>((resolve, reject) => {
        return this.userService.getUserDetailById(decoded.id).then((user) => {
          if (user) {
            resolve(true);
          } else {
            reject(false);
          }
        });
      });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}

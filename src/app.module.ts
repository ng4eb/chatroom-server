import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { AppGateway } from './app.gateway';
import { WsGuard } from './utils/ws.guard';

@Module({
  imports: [AuthModule, PrismaModule, UserModule, ChatModule],
  providers: [AppGateway, WsGuard],
})
export class AppModule {}

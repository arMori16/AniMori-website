import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { JwtService } from '@nestjs/jwt';
import { SeriesInfoModule } from './seriesInfo/seriesInfo.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CommentsModule } from './comments/comments.module';
import { MediaModule } from './media/media.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [AuthModule,AdminModule,RoomModule,UserModule,MediaModule,PrismaModule,SeriesInfoModule,MailModule,ConfigModule.forRoot({ isGlobal: true }),CommentsModule,MailerModule.forRoot({
    transport: {
      host:'smtp.gmail.com', // Укажите правильный SMTP-хост
      port: 465, // Порт
      secure: true, // true для защищенного соединения
      auth: {
        user: 'barasekson67@gmail.com',
        pass: 'rzyuekzltcerruoz' // Введите пароль или ключ приложения
      }
    },
    defaults:{
      from:'"Mori🍃" <barasekson67@gmail.com>'
    },
    template:{
      
    }
  })],
  controllers: [AppController],
  providers: [AppService,JwtService],
})
export class AppModule implements NestModule{

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply()
      .forRoutes('*'); // Или укажите конкретные маршруты
    }
}

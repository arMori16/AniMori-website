import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

import { CookieMiddleware } from './auth/strategy/cookies.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin:'http://localhost:3000',
    credentials:true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true, // Automatically transform types
      },
    }),
  );
  app.use(
    session({
      secret:process.env.SESSION_SECRET,
      resave:false,
      saveUninitialized:false
    })
  )
  await app.listen(3001);
}
bootstrap();

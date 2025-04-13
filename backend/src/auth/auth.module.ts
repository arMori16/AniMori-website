import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AtGuard } from "src/common/guards";
import { AtStrategy } from "./strategy/at.strategy";
import { RtStrategy } from "./strategy/rt.strategy";
import { APP_GUARD } from "@nestjs/core";

@Module({
    imports:[PrismaModule,ConfigModule],
    controllers:[AuthController],
    providers:[AuthService,JwtService,ConfigService,{
      provide:APP_GUARD,
      useClass: AtGuard
    },AtStrategy,RtStrategy]
})
export class AuthModule{}
import { Module } from "@nestjs/common";
import { RoomGateWay } from "./room.gateway";
import { RoomController } from "./room.controller";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { APP_GUARD } from "@nestjs/core";
import { AtGuard } from "src/common/guards";
import { RoomService } from "./room.service";
import { AtStrategy } from "src/auth/strategy/at.strategy";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports:[PrismaModule],
    controllers:[RoomController],
    providers:[RoomGateWay,PrismaService,{
        provide:APP_GUARD,
        useClass:AtGuard
    },AtGuard,RoomService,AtStrategy,JwtService]
})

export class RoomModule{};
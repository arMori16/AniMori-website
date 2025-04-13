import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsGateway } from "websockets/websockets";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { CommentsController } from "./comments.controller";
import { AtGuard, RtGuard } from "src/common/guards";
import { APP_GUARD } from "@nestjs/core";
import { AdminGuard } from "src/common/guards/admin.guard";
import { JwtService } from "@nestjs/jwt";



@Module({
    imports:[PrismaModule],
    controllers:[CommentsController],
    providers:[CommentsService,PrismaService,AdminGuard,JwtService,CommentsGateway,AtGuard,{
        provide:APP_GUARD,
        useClass: AtGuard
      },RtGuard]
})
export class CommentsModule{}
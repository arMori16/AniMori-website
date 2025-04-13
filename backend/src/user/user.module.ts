import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { PrismaService } from "src/prisma/prisma.service";
import { AtGuard } from "src/common/guards";
import { AdminGuard } from "src/common/guards/admin.guard";
import { PrismaModule } from "src/prisma/prisma.module";
import { APP_GUARD } from "@nestjs/core";
import { SeriesInfoService } from "src/seriesInfo/seriesInfo.service";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports:[PrismaModule],
    controllers:[UserController],
    providers:[UserService,SeriesInfoService,JwtService,PrismaService,AtGuard,AdminGuard,{
        provide:APP_GUARD,
        useClass: AtGuard
      }],
})
export class UserModule{}
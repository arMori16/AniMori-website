import { Module } from "@nestjs/common";
import { SeriesInfoService, VideoFormatterService } from "./seriesInfo.service";
import { SeriesInfoController, VideoFormatter } from "./seriesInfo.controller";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { AtGuard } from "src/common/guards";
import { APP_GUARD } from "@nestjs/core";
import { AtStrategy } from "src/auth/strategy/at.strategy";
import { AdminGuard } from "src/common/guards/admin.guard";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports:[PrismaModule],
    controllers:[SeriesInfoController,VideoFormatter],
    providers:[SeriesInfoService,PrismaService,VideoFormatterService,JwtService,AdminGuard,AtStrategy],

})
export class SeriesInfoModule{}
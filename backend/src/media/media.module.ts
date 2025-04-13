import { Module } from "@nestjs/common";
import { MediaService } from "./media.service";
import { MediaController } from "./media.controller";
import { AtGuard } from "src/common/guards/at.guard";
import { AdminGuard } from "src/common/guards/admin.guard";
import { PrismaModule } from "src/prisma/prisma.module";



@Module({
    imports:[PrismaModule],
    controllers:[MediaController],
    providers:[MediaService,AtGuard,AdminGuard]
})
export class MediaModule{};
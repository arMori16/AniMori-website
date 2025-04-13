import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AtStrategy } from "src/auth/strategy/at.strategy";
import { AdminGuard } from "src/common/guards/admin.guard";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";



@Module({
    imports:[PrismaModule],
    controllers:[AdminController],
    providers:[AtStrategy,AdminGuard,PrismaService,JwtService]
})
export class AdminModule{};
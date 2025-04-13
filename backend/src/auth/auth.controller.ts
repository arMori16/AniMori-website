import { BadRequestException, Body, Controller, Post, Req, Res,Get, UseGuards, Session, Query, ForbiddenException, HttpException, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { Public } from "src/common/decorators/public.decorator";
import { GetCurrentUserId } from "src/common/decorators/get-current-userId.decorator";
import { GetCurrentUser } from "src/common/decorators/get-current-user.decorator";
import { JwtPayload } from "./types/jwtPayload.type";
import { Tokens } from "./types";
import { AuthGuard } from "@nestjs/passport";
import { AtGuard } from "src/common/guards/at.guard";
import { RtGuard } from "src/common/guards";
import session from "express-session";
import * as jwt from 'jsonwebtoken';
import { AdminGuard } from "src/common/guards/admin.guard";
import { Request,Response } from "express";
import { Cookies } from "src/common/decorators/get-cookies.decorator";


@Controller('/')
export class AuthController{
    constructor(private service:AuthService){}
    @Public()
    @Post('')
    async handleAuth(@Body() dto:AuthDto){
        try {
            if (dto.action === 'signup') {
                return await this.service.signup(dto);
            }
            if (dto.action === 'login') {
                return await this.service.signin(dto);
            }
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw new HttpException(
                    {
                        message: error.message,
                        error: error.name,
                    },
                    HttpStatus.FORBIDDEN
                );
            }
            console.error('Error in AuthController:', error);  // Логируем ошибку
            throw new BadRequestException(error);
        }
    }
    @UseGuards(AtGuard)
    @Post('logout')
    async logout(@GetCurrentUserId() userId:number):Promise<boolean>{
        if (!userId) {
            throw new BadRequestException('User ID not found');
        }
        return this.service.logout(userId);
    }
    @Public()
    @UseGuards(RtGuard)
    @Post('refresh')
    async refreshTokens(@GetCurrentUserId() userId:number,
                        @GetCurrentUser('refreshToken') refreshToken:string):Promise<Tokens>{
                            if(!userId){throw new BadRequestException('User ID not found');}
                            return this.service.refreshTokens(userId,refreshToken);

    } 
    @Public()
    @Post('refresh/server')
    async refreshCookiesByServer(@Body('refreshToken') refreshToken:string,@Req() req:Request,@Res() res:Response){
        try {
            const decodedAccessToken = jwt.verify(refreshToken,process.env.JWT_REFRESH_TOKEN) as { sub: string };
            const userId = decodedAccessToken?.sub;
            const tokens:Tokens = await this.service.refreshTokens(Number(userId),refreshToken);
            res.cookie('refreshToken', tokens.refresh_token, {
            
                maxAge: 28 * 24 * 60 * 60 * 1000,
            });
            res.cookie("accessToken",tokens.access_token,{
            
                maxAge: 15 * 60 * 1000,
            })
            console.log('This is res token!',tokens.access_token);
            
            return {access_token:tokens.access_token};
        } catch (err) {
        return res.status(403).json({ message: 'Invalid refresh token' });
        }
    }
    @UseGuards(AtGuard)
    @Get('getUserId')
    async getUserId(@GetCurrentUserId() userId:number):Promise<number>{
        if (!userId) {
            throw new BadRequestException('User ID not found');
        }
        return this.service.getUserId(userId);
    }
    @Public()
    @Get('/user/exist')
    async isUserEmailExist(@Query('email') email:string){
        return await this.service.isUserEmailExist(email);
    }
}
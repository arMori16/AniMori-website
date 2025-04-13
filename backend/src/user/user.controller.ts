import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { AtGuard } from "src/common/guards";
import { GetCurrentUserId } from "src/common/decorators";
import { FileInterceptor } from "@nestjs/platform-express";
import * as path from "path";
import {promises as fs} from "fs";
import { SeriesStatus } from "./dto/userList.enum";
import { AdminGuard } from "src/common/guards/admin.guard";
import { Request, Response } from "express";
import { Public } from "src/common/decorators/public.decorator";
import { JwtService } from "@nestjs/jwt";


@Controller('/user')
export class UserController{
    constructor(private readonly service:UserService,private readonly jwtService:JwtService){}
    @UseGuards(AtGuard)
    @Get('/firstname')
    async getUserFirstName(@GetCurrentUserId() userId:number){
        return await this.service.getUserFIrstName(userId);
    }
    @Public()
    @Get('/profile/info')
    async getUserProfileInfo(@Req() req:Request,@Query('userId') userId?:number){
        let userAuthId:number | null;
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1]; // Extract token
                const decoded: any = this.jwtService.decode(token); // Decode JWT
                userAuthId = Number(decoded?.sub) || null;
            } catch (err) {
                console.error('Invalid token:', err);
            }
        }
        const userLastViewedSeries = await this.service.getUserLastViewedSeries(userId || userAuthId);
        const userInfo = await this.service.getUserProfileInfo(userId || userAuthId);
        return {userInfo:userInfo,userLastViewedSeries:userLastViewedSeries,Owner:userId === Number(userAuthId)}
    }
    @Post('/lastViewedSeries')
    async setLastViewedSeries(@Body('seriesName') seriesName:string,@Body('seriesViewName') seriesViewName:string,@Body('episode') episode:number,@GetCurrentUserId() userId:number,@Body('timeStopped') timeStopped?:string){
        return await this.service.setLastViewedSeries(seriesName,Number(episode),userId,seriesViewName,Number(timeStopped) || null)
    }
    @Put('/lastViewedSeries')
    async updateLastViewedSeries(@Body('seriesName') seriesName:string,@Body('episode') episode:number,@GetCurrentUserId() userId:number,@Body('timeStopped') timeStopped:string){
        return await this.service.updateLastViewedSeries(userId,seriesName,episode,Number(timeStopped))
    }
    @UseGuards(AtGuard)
    @UseInterceptors(FileInterceptor('image'))
    @Post('/avatar/upload')
    async setUserAvatar(@Body('firstName') firstName:string,@GetCurrentUserId() userId:number,@UploadedFile() file){
        try{
            const extensions = ['jpg', 'png', 'jpeg', 'webp','avif'];
            const pathToFiles = path.join(__dirname,'..','..','..',`avatars`);
            const extname = path.extname(file.originalname).toLowerCase();
            const fileName = `${firstName}_${userId}`;
            const pathName = path.join(pathToFiles,fileName);
            for(const ext of extensions){
                const potentialPath = `${pathName}.${ext}`
                await fs.access(potentialPath).then(async() => {await fs.rm(potentialPath)}).catch(() => false);
            }
            if(extensions.includes(extname.slice(1))){
                await fs.writeFile(`${pathName}${extname}`,file.buffer).catch((err)=>{
                    throw new BadRequestException(`Can't save file to path!\n${err}`);
                    })
            }else{
                throw new BadRequestException('You can upload an image only with the specific extensions!')
            }
        }catch(err){
            console.error(err);
            throw new BadRequestException('Error when tried to upload an image!')
        }
    }
    @Post('/userList/item')
    async postUserListItem(@Body('seriesName') seriesName:string,
                           @GetCurrentUserId() userId:number,
                           @Body('userListItem') userListItem:string,
                           @Body('seriesViewName') seriesViewName:string
                        ){
        return await this.service.postUserItemList(seriesName,seriesViewName,userId,userListItem);
    }
    @Get('userList/item')
    async getUserListItem(@Query('seriesName') seriesName:string,@GetCurrentUserId() userId:number){
        return await this.service.getUserListItem(seriesName,userId);
    }
    @Public()
    @Get('/profile/userList/info')
    async getUserProfileListInfo(@Query('userId') userId:number){
        const data = await this.service.getUserProfileListInfo(userId)
        return {...data}
    }
    @UseGuards(AtGuard)
    @Get('/userList/schedule')
    async getUserListItemsSchedule(@GetCurrentUserId() userId:number,@Query('seriesNames') seriesNames:string[]){
        return await this.service.getUserListItemsSchedule(userId,seriesNames)
    }
    @Get('/userList/count')
    async getUserListItemsCount(@GetCurrentUserId() userId:number){
        return await this.service.getUserListItemsCount(userId);
    }
    @Patch('/userList/delete/item')
    async patchUserListItem(@GetCurrentUserId() userId:number,@Body('seriesName') seriesName:string){
        return await this.service.patchUserListItem(userId,seriesName);
    }
    @Get('/series/timeStopped')
    async getUserTimeStopped(@GetCurrentUserId() userId:number,@Query('seriesName') seriesName:string,@Query('episode') episode:number){
        return await this.service.getUserTimeStopped(userId,seriesName,episode);
    }
    @UseGuards(AdminGuard)
    @Get('search')
    async searchUser(@Query('param') firstName:string,@Query('skip') skip:number){
        return await this.service.searchUser(firstName,Number(skip));
    }
    @UseGuards(AdminGuard)
    @Get('/users')
    async getUsers(@Query('skip') skip:number){
        return await this.service.getUsers(Number(skip));
    }
    @UseGuards(AdminGuard)
    @Put('/info')
    async handleUpdateUserInfo(@Body('email') email:string,@Body('operationType') operationType:string,@Body('data') data:boolean | number){
        return await this.service.handleUpdateUserInfo(email,operationType,data);
    }
    @UseGuards(AtGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Post('/avatar')
    async postAvatar(@GetCurrentUserId() userId:number,@UploadedFile('file') file:Express.Multer.File){
        return await this.service.postAvatar(userId,file);
    };
    @Public()
    @Get('/avatar')
    async getAvatar(@Req() req:Request,@Res() res:Response,@Query('userId') userId?:number | null){
        let userAuthId:number | null;
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1]; // Extract token
                const decoded: any = this.jwtService.decode(token); // Decode JWT
                userAuthId = Number(decoded?.sub) || null;
            } catch (err) {
                console.error('Invalid token:', err);
            }
        }
        return await this.service.getAvatar(userAuthId ? userAuthId : userId,res);
    }
    @Public()
    @Get('/avatar/:userId')
    async getAvatarById(@Param('userId') userId:number,@Res() res:Response){
        return await this.service.getAvatar(userId,res);
    }
}
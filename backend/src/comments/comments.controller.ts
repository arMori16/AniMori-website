import { Body, Controller, Delete, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsDto } from "websockets/comment.dto";
import { CommentsGateway } from "websockets/websockets";
import { Public } from "src/common/decorators/public.decorator";
import { AtGuard, RtGuard } from "src/common/guards";
import { GetCurrentUserId } from "src/common/decorators";
import { AdminGuard } from "src/common/guards/admin.guard";
import { JwtService } from "@nestjs/jwt";




@Controller('/comments')
export class CommentsController{
    constructor(private readonly service:CommentsService,private readonly gateway:CommentsGateway,private jwtService:JwtService){}
    @Post('create')
    async createComment(@Body() dto:CommentsDto,@GetCurrentUserId() userId:number){
        const info = {...dto,userId:userId}
        const comment = this.service.createComment(info);
        this.gateway.server.emit('Comment Created!',comment);
        return comment;
    }
    @UseGuards(AdminGuard)
    @Get('commentById')
    async getCommentById(@Query('commentId') commentId:number){
        return await this.service.getCommentById(commentId);
    }  
    @Public()
    @Get('users')
    async getCommentUsers(@Query('seriesName') seriesName:string,@Query('skip') skip:number,@Req() req){
        let userId: string | null = null;

        // Extract user ID if token is provided
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1]; // Extract token
                const decoded: any = this.jwtService.decode(token); // Decode JWT
                userId = decoded?.sub || null;
            } catch (err) {
                console.error('Invalid token:', err);
            }
        }
        console.log('Query: ',seriesName + 'Skip: ' + skip);
        return await this.service.getCommentUsers(seriesName,Number(skip),userId && Number(userId));
    }
    @UseGuards(AtGuard)
    @Get('/admin')
    async getComments(@Query('take') take:number,@Query('skip') skip:number){
        return await this.service.getComments(Number(take),Number(skip))
    }
    @UseGuards(AdminGuard)
    @Get('/admin/user/history')
    async getHistory(@Query('userName') userName:string,@Query('skip') skip:number){
        return await this.service.getUserHistory(userName,Number(skip))
    }
    @UseGuards(AtGuard)
    @Delete('/admin')
    async commentDelete(@Query('CommentId') commentId:number){
        return this.service.deleteComment(Number(commentId))
    }
    @UseGuards(AtGuard)
    @Post('/react')
    async reactToComment(@GetCurrentUserId() userId:number,@Body('commentId') commentId:number,@Body('type') type:string,@Body('seriesName') seriesName:string){
        return await this.service.reactToComment(userId,commentId,type,seriesName)
    }
    @Public()
    @Get('/reacts')
    async getReacts(@Req() req,@Query('seriesName') seriesName:string){
        let userId:string | null;
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1]; // Extract token
                const decoded: any = this.jwtService.decode(token); // Decode JWT
                userId = decoded?.sub || null;
            } catch (err) {
                console.error('Invalid token:', err);
            }
        }
        return await this.service.getReacts(seriesName,userId ? Number(userId) : null);
    }
    @UseGuards(AtGuard)
    @Delete('/react')
    async deleteReact(@GetCurrentUserId() userId:number,@Query('commentId') commentId:number){
        return await this.service.deleteReact(userId,commentId);
    }
}
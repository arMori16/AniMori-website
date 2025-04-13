import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CommentsDto } from "websockets/comment.dto";
import { ReactType } from "./dto/react.dto";
import { LikeType } from "@prisma/client";



@Injectable()
export class CommentsService{
    constructor(private readonly prisma:PrismaService){}
    async createComment(info:any){
        try{
            const userName = await this.prisma.user.findUnique({
                where:{
                    id:info.userId
                },
                select:{
                    firstName:true
                }
            })
            const req = await this.prisma.comments.create({
                data:{
                    SeriesName:info.seriesName,
                    ParentId:info.parentId,
                    UserId:info.userId,
                    CommentText:info.commentText,
                    UserName: userName.firstName
                },
                include:{
                    user:true,
                    parent:true,    
                }
            })
            return req;
        }catch(err){
            console.error('Error when trying to createComment!');
            console.error(err)
        }
    }
    async getCommentUsers(seriesName:string,skip:number,userId?:number){
        try{
            const userName = userId && await this.prisma.user.findUnique({
                where:{
                    id:userId
                },
                select:{
                    firstName:true
                }
            }) || null;
            const commentUsers = await this.prisma.comments.findMany({
                where:{
                    SeriesName:seriesName
                },
                skip:skip || 0,
                take:15,
                orderBy:{
                    createdAt:'desc'
                },
                select:{
                    Id:true,
                    createdAt:true,
                    ParentId:true,
                    CommentText:true,
                    UserId:true,
                    SeriesName:true,
                    UserName:true
                }
            })
            const findPotentialOwner = userName && commentUsers.map((item:any)=>{
                if(item.UserName === userName.firstName){
                    return {...item,Owner:true};
                }else{
                    return {...item};
                }
            }) || null;
            return findPotentialOwner ? findPotentialOwner : commentUsers;
        }catch(err){
            console.log(err);
            
        }
    }
    async getComments(take:number,skip:number){
        try{
            const data = await this.prisma.comments.findMany({
                skip:skip || 0,
                take:take || 15,
                orderBy:{
                    'createdAt':'desc'
                },
                select:{
                    UserId:true,
                    SeriesName:true,
                    CommentText:true,
                    Id:true,
                    createdAt:true,
                    UserName:true
                }
            })
            return data;
        }catch(err){
            throw new BadRequestException(`Cannot take the comments!Error: ${err}`)
        }
    }
    async deleteAllComments(){
        const deleteComments = await this.prisma.comments.deleteMany();
    }
    async deleteComment(commentId:number){
        try{
            const req = await this.prisma.comments.delete({
                where:{
                    Id:commentId
                }
            })
            return req
        }catch(err){
            throw new BadRequestException(`Couldn't delete a comment!Error ${err}`)
        }
    }
    async getUserHistory(userName:string,skip:number){
        try{
            const req = await this.prisma.comments.findMany({
                where:{
                    UserName:userName
                },
                orderBy:{
                    'createdAt':'desc'
                },
                take:15,
                skip:skip,
                select:{
                    UserId:true,
                    SeriesName:true,
                    CommentText:true,
                    Id:true,
                    createdAt:true,
                    UserName:true
                }

            })
            return req;
            
        }catch(err){
            throw new BadRequestException(`Cannot get user history comments!ErrorL ${err}`)
        }

    }
    async reactToComment(userId:number,commentId:number,react:string,seriesName:string){
        try{
            const validReactType = Object.values(LikeType).includes(react as LikeType) ? (react as LikeType) : null;
            if (!validReactType) {
                throw new BadRequestException(`Invalid reaction type: ${react}`);
            }

            const postReact = await this.prisma.like.upsert({
                where: {
                    UserId_CommentId: {
                        UserId: userId,
                        CommentId: commentId
                    }
                },
                update: { Type: validReactType },
                create: {
                    UserId: userId,
                    CommentId: commentId,
                    Type: validReactType,
                    SeriesName:seriesName
                }
            });

        }catch(err){
            throw new BadRequestException(err);
        }
    }
    async getReacts(seriesName:string,userId?:number | null){
        try{
            const reacts = await this.prisma.like.findMany({
                where:{
                    SeriesName:seriesName
                }
            });
            const potentialUserReacts = (userId && reacts.map((item)=>(item.UserId === userId ? {...item,Owner:true} : {...item}))) || null;
            return potentialUserReacts ? potentialUserReacts : reacts
        }catch(err){
            throw new BadRequestException(err);
        }
    }
    async deleteReact(userId:number,commentId:number){
        try{
            const deleteReact = await this.prisma.like.delete({
                where:{
                    UserId_CommentId:{
                        UserId:userId,
                        CommentId:commentId
                    }
                }
            })
        }catch(err){
            throw new BadRequestException(err)
        }
    }
    async getCommentById(commentId:number){
        try{
            const comment = await this.prisma.comments.findUnique({
                where:{
                    Id:commentId
                }
            });
            return comment;
        }catch(err){
            throw new BadRequestException(`Cannot get comment by id!Error: ${err}`)
        }
    }
}
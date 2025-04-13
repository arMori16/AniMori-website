import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, PrismaClient, SeriesStatus } from "@prisma/client";
import { json } from "body-parser";
import { Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.service";
import { SeriesInfoService } from "src/seriesInfo/seriesInfo.service";
import * as path from "path";





@Injectable()
export class UserService{
    private readonly logger = new Logger(UserService.name)
    constructor(private readonly prisma:PrismaService,private readonly service:SeriesInfoService){}
    async getUserFIrstName(userId:number){
        try{
            const userFirstName = await this.prisma.user.findUnique({
                where:{
                    id:userId
                },
                select:{
                    firstName:true,
                    id:true
                }
            })
            return userFirstName;
        }catch(err){
            console.error(`Couldn't get firstname.Error: ${err}`);
            throw new BadRequestException(`Couldn't get firstname.Error: ${err}`)
        }
    }
    async getUserProfileInfo(userId:number){
        try{
            const userInfo = await this.prisma.user.findUnique({
                where:{
                    id:userId
                },
                select:{
                    firstName:true,
                    createdAt:true,
                    email:true,
                    warn:true,
                    role:true,
                    isBanned:true
                }
            })
            return userInfo;
        }catch(err){
            console.error(`Couldn't get user's profile info!Error: ${err}`);
            throw new BadRequestException(`Couldn't get user's profile info!Error: ${err}`)
        }
    }
    async setLastViewedSeries(seriesName:string,episode:number,userId:number,seriesViewName:string,timeStopped:number){
        try{
            const isExist = await this.prisma.lastViewedSeries.findUnique({
                where: {
                    UserId_SeriesName_Episode: {
                      UserId: userId, // Ensure userId exists
                      SeriesName: seriesName, // Ensure seriesName exists
                      Episode:episode
                    },
                  },
            })
            if(isExist){
                return 'This series already exist in last viewed!'
            }
            const setLastViewedSeries = await this.prisma.lastViewedSeries.create({
                data:{
                    SeriesName:seriesName,
                    SeriesViewName:seriesViewName,
                    Episode:episode,
                    UserId:userId
                }
            })
            return setLastViewedSeries;
        }catch(err){
            console.error(`Error setting last user series!Error: ${err}`);
            throw new BadRequestException(`Error setting last user series!Error: ${err}`)
        }
    }
    async updateLastViewedSeries(userId:number,seriesName:string,episode:number,timeStopped:number){
        try{
            const updatedLastViewed = await this.prisma.lastViewedSeries.update({
                where:{
                    UserId_SeriesName_Episode: {
                        UserId: userId,
                        SeriesName: seriesName,
                        Episode:episode
                    },
                },
                data:{
                    Episode:episode,
                    TimeStopped:timeStopped
                }
            })
            return updatedLastViewed;
        }catch(err){
            console.error(err);
            
        }
    }
    async getUserLastViewedSeries(userId:number){
        try{
            const userLastViewedSeries = await this.prisma.lastViewedSeries.findMany({
                take:6,
                orderBy:{
                    LastViewed:'desc'
                },
                where:{
                    UserId:userId
                },
            
            });
            const seriesNames:string[] = userLastViewedSeries.map((item:any,index:number)=>{
                return item.SeriesName;
            })
            const seriesRates = await this.service.getItemsRate(seriesNames);
            return {userLastViewedSeries:userLastViewedSeries,rates:seriesRates};
        }catch(err){
            console.error(`Couldn't get user last viewed series list.${err}`);
            throw new Error('Error fetching last viewed series');
        }
    }
    async postUserItemList(seriesName:string,seriesViewName:string,userId:number,userListItem:string){
        try{
            const validStatus = Object.values(SeriesStatus).includes(userListItem as SeriesStatus)
            ? (userListItem as SeriesStatus)
            : null;
            const userList = await this.prisma.userList.upsert({
                where: {
                    UserId_SeriesName: {
                      UserId: userId,
                      SeriesName: seriesName,
                    },
                },
                create:{
                    SeriesName:seriesName,
                    UserId:userId,
                    Status:validStatus,
                    SeriesViewName:seriesViewName
                },
                update: {
                    Status: validStatus, // Update the status if it exists
                }
            })
        }catch(err){
            console.error(`Couldn't set user list's item: `,err);
            throw new BadRequestException(err)
        }
    }
    async getUserListItem(seriesName:string,userId:number){
        try{
            const userItem = await this.prisma.userList.findUnique({
                where:{
                    UserId_SeriesName:{
                        UserId:userId,
                        SeriesName:seriesName
                    }
                },
                select:{
                    Status:true,
                    Favorite:true
                }
            });
            return userItem;
        }catch(err){
            console.error(err);
        }
    }
    async getUserProfileListInfo(userId:number){
        try{
            const userListItemInfo = await this.prisma.userList.findMany({
                where:{
                    UserId:userId,
                }
            });
            const counts = await this.prisma.userList.groupBy({
                by: ["Status"],
                where: {
                    UserId: userId,
                    Status: null
                },
                _count: {
                    Status: true,
                }
            });
            
            const groupedCounts = await this.prisma.userList.groupBy({
                by: ["Status"],
                where: {
                    UserId: userId,
                    Status:{not:null}
                },
                _count: {
                    Status: true,
                }
            });
            return {userListItemsInfo:userListItemInfo,counts:groupedCounts};
        }catch(err){
            console.error(err);
            throw new BadRequestException(err)
        }
    }
    async getUserListItemsCount(userId:number){
        try{
            const counts = await this.prisma.userList.groupBy({
                by:['Status'],
                where:{
                    UserId:userId
                },
                _count: {
                    Status: true,
                },
            })
            return counts;
        }catch(err){
            console.error(err);
        }
    }
    async patchUserListItem(userId:number,seriesName:string){
        try{
            const patchUserItem = await this.prisma.userList.update({
                where:{
                    UserId_SeriesName:{
                        UserId:userId,
                        SeriesName:seriesName
                    }
                },
                data:{
                    Status:null
                }
            })
        }catch(err){
            console.error(`Couldn't delete user list item`,err);
            throw new BadRequestException(`Error: ${err}`)
        }
    }
    async getUserTimeStopped(userId:number,seriesName:string,episode:number){
        try{
            const timeStopped = await this.prisma.lastViewedSeries.findUnique({
                where:{
                    UserId_SeriesName_Episode:{
                        UserId:userId,
                        SeriesName:seriesName,
                        Episode:episode
                    },
                },
                select:{
                    TimeStopped:true
                }
            });
            return timeStopped;
        }catch(err){
            console.error(`Couldn't get the last user time stopped: `,err);
            
            throw new BadRequestException(err)
        } 
    }
    async searchUser(firstName:string,skip:number){
        try{
            const users = await this.prisma.user.findMany({
                where: {
                  firstName: {
                    contains: firstName, // Searches for any user with firstName containing the input
                    mode: 'insensitive', // Optional: Makes the search case-insensitive
                  },
                },
                skip: skip, 
                take: 15,               
              });
          
              return users;
        }catch(err){

        }
    }
    async getUsers(skip:number){
        try{
            const users = await this.prisma.user.findMany({
                take:15,
                skip:skip || 0,
                select:{
                    firstName:true,
                    email:true,
                    id:true,
                    isBanned:true,
                    createdAt:true,
                    role:true,
                    warn:true,
                    _count:{
                        select:{
                            comments:true
                        }
                    }
                }
            })
            return users;
        }catch(err){
            throw new BadRequestException(err)
        }
    }
    async handleUpdateUserInfo(email:string,operationType:string,data:boolean | number){
        try{
            const userInfo = await this.prisma.user.update({
                where:{
                    email:email
                },
                data:{
                    [operationType]:data
                }
            });
        }catch(err){
            throw new BadRequestException(err)
        }
    }
    async postAvatar(userId:number,file:Express.Multer.File){
        try{
            const validExtensions = ['jpg','jpeg','png'];
            const isValid = validExtensions.includes(file.mimetype.split('/')[1]);
            if(isValid){
                const parentFolder = path.join(__dirname,'..','..','..','avatars');
                console.log(`Parent folder: `,parentFolder);
                if(!parentFolder){
                    await fs.mkdir(parentFolder,{recursive:true});
                }
                for(const ext of validExtensions){
                    const potentialPath = path.join(parentFolder,`${userId}.${ext}`);
                    console.log(`POTENTIAL PATH FOR DELETION: `,potentialPath);
                    try {
                        await fs.access(potentialPath);
                       
                        await fs.rm(potentialPath);
                    } catch (error) {
                        console.error(`Error occurred while trying to delete ${potentialPath}: `);
                    }
                }
                const newUserAvatar = await fs.writeFile(path.join(parentFolder,`${userId}.${file.mimetype.split('/')[1]}`),file.buffer);
                return 'Successfully uploaded an avatar!';
            }else{
                throw new BadRequestException(`You can upload an image only by [${validExtensions}]!`)
            }
        }catch(err){
            console.error(err);
            throw new BadRequestException(err)
        }
    }
    async getAvatar(userId:number,res:Response){
        try{
            const validExtensions = ['jpg','jpeg','png'];
            const parentFolder = path.join(__dirname,'..','..','..','avatars');
            for(const ext of validExtensions){
                const potentialPath = path.join(parentFolder,`${userId}.${ext}`);
                try{
                    await fs.access(potentialPath);
                    return res.sendFile(potentialPath)
                }catch(err){
                    console.error(`File not found: ${potentialPath}`);
                }
            }
            const defaultAvatar = path.join(__dirname,'..','..','..','avatars','default.jpeg');
            return res.sendFile(defaultAvatar);
        }catch(err){
            console.error(err);
            throw new BadRequestException(err)
        }
    }
    async getUserListItemsSchedule(userId:number,seriesNames:string[]){
        try{
            const scheduleUserListItems = await this.prisma.userList.findMany({
                where:{
                    UserId:userId,
                    SeriesName:{in:seriesNames}
                }
            })
            return scheduleUserListItems;
        }catch(err){
            console.error(err);
            throw new BadRequestException(err)
        }
    }
}
import { BadRequestException, Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { PrismaService } from "src/prisma/prisma.service";



@Injectable()
export class RoomService{
    constructor(private readonly prisma:PrismaService){}
    async generateCode(){
        return randomBytes(20).toString('base64').slice(0, 20);
    }
    async handleCreateRoom(userId:number,seriesName:string){
        try{
            let roomCode = await this.generateCode();
            console.log(`This is a room CODE: `,roomCode);
            
            const isExist = await this.prisma.room.findUnique({
                where:{
                    HostId:userId
                }
            });
            if (isExist === null) {
                console.log("No existing room found for the user.");
            } else {
                // Proceed with the roomCode check if a room exists
                while (roomCode === isExist.Code) {
                    roomCode = await this.generateCode();
                }
                if(userId === isExist.HostId){
                    throw new BadRequestException(`This user already has created room!`)
                }
            }
            const newRoom = await this.prisma.room.create({
                data:{
                    HostId:userId,
                    SeriesName:seriesName,
                    Code:roomCode
                }
            })
            const userInfo = await this.prisma.user.findUnique({
                where:{
                    id:userId
                },
                select:{
                    firstName:true
                }
            })
            const newParticipant = await this.prisma.participant.create({
                data:{
                    UserName:userInfo.firstName,
                    IsHost:true,
                    UserId:userId,
                    RoomId:newRoom.Id
                }
            })
            /* const hostInfo = {...userInfo,} */
            return {
                room:newRoom,
                host:userInfo
            }
        }catch(err){
            console.error(err);
            throw new Error(`Error!Couldn't create a room... ${err}`)
        }
    }
    async joinRoom(userId:number,code:string,seriesName:string){
        try{
            const isExistInTheRoom = await this.prisma.participant.findUnique({
                where:{
                    UserId:userId,
                }
            })
            if(isExistInTheRoom){
                throw new Error(`Before join to the room,make sure you left the last joined room`)
            }
            const room = await this.prisma.room.findUnique({
                where:{
                    SeriesName:seriesName,
                    Code:code
                }
            })
            const userInfo = await this.prisma.user.findUnique({
                where:{
                    id:userId
                },
                select:{
                    firstName:true
                }
            })
            const newParticipant = await this.prisma.participant.create({
                data:{
                    UserName:userInfo.firstName,
                    UserId:userId,
                    RoomId:room.Id
                }
            })
            return newParticipant;
        }catch(err){
            console.error(err);
            throw new BadRequestException(err)
        }
    }

    async handleDisconnect(userId: number) {
        try {
            // Check if the participant exists
            const participant = await this.prisma.participant.findUnique({
                where: { UserId: userId },
            });
    
            if (!participant) {
                // If participant doesn't exist, no action is needed
                console.log(`User ${userId} is not part of any room.`);
                return;
            }
    
            // Check if the user is the host of a room
            const room = await this.prisma.room.findUnique({
                where: { HostId: userId },
            });
    
            if (room) {
                // The user is the host, delete the room
                await this.prisma.room.delete({
                    where: { HostId: userId },
                });
                console.log(`Room hosted by user ${userId} has been deleted.`);
            } else {
                // The user is not the host, remove them as a participant
                await this.prisma.participant.delete({
                    where: { UserId: userId },
                });
                console.log(`User ${userId} has been removed from the room.`);
            }
            return participant;
        } catch (err) {
            console.error(err);
            throw new BadRequestException(err);
        }
    }
    async getUserInfo(userId:number){
        try{
            const roomId = await this.prisma.participant.findUnique({
                where:{
                    UserId:userId
                }
            })
            if (!roomId) {
                console.warn(`User ${userId} is not in any room.`);
                return null;
            }
            const participantsInfo = await this.prisma.participant.findMany({
                where:{
                    RoomId:roomId.RoomId
                }
            });
            const roomInfo = await this.prisma.room.findUnique({
                where:{
                    Id:roomId.RoomId
                }
            })
            const userInfo = await this.prisma.user.findUnique({
                where:{
                    id:roomInfo.HostId
                },
                select:{
                    firstName:true
                }
            })
            const hostInfo = {host:userInfo,room:roomInfo}
            const participants = participantsInfo.filter((item)=>item.UserId !== roomInfo.HostId);
            console.log(`ALL PARTICIPANTS INFO: `,participants);
            console.log(`ALL HOST INFO: `,hostInfo);
            
            return {
                hostInfo:hostInfo,
                participants:participants,
                isHost:roomId.IsHost
            }
        }catch(err){
            console.error(err);
            throw new BadRequestException(err)
        }
    }
}
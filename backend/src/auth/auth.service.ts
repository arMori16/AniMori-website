import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { AuthDto } from "./dto/auth.dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import { JwtPayload } from "./types/jwtPayload.type";
import {Tokens} from './types';
import axios from "axios";


@Injectable()
export class AuthService{
    constructor(private prisma:PrismaService,private jwt:JwtService,private config:ConfigService){}
    async signup(dto:AuthDto){
        const oldUser = await this.prisma.user.findUnique({
            where:{
                email:dto.email,
            }
        })
        if(oldUser) throw new BadRequestException('This user is already exist')
        if(oldUser.isBanned) throw new BadRequestException('This user is banned!');

        //hash the password
        const hash = await argon.hash(dto.password);
        const userIP = await this.getUserIP();
        console.log(`This is uSERIP: `,userIP);
        try{
            const user = await this.prisma.user.create({
                data:{
                    email:dto.email,
                    hash:hash,
                    firstName:dto.firstName,
                },
                select:{
                    id:true,
                    email:true,
                    firstName:true,
                    createdAt:true
                }
            })
            const tokens:Tokens = await this.signToken(user.id,user.email);
            return {user,tokens};
        }catch(error){
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Credentials taken!')
                }
            }
            throw error;

        }
        //if it incorrect we decline it 
    }
    async getUserIP(){
        try {
            const response = await axios.get('https://api64.ipify.org?format=json');
            return response.data.ip;  // The user's public IP
        } catch (error) {
            console.error('Error fetching IP:', error);
            throw new Error('Failed to retrieve IP address');
        }
    }
    async signin(dto:AuthDto){
        const user = await this.prisma.user.findUnique({
            where: {
                email:dto.email
            }
        })
        if(user.isBanned) throw new BadRequestException('This user is banned!');
        if(!user){
            throw new ForbiddenException('Credential incorrect')
        }
        const pwMatches = await argon.verify(user.hash,dto.password);
        if(!pwMatches){
            throw new ForbiddenException('Credentials incorrect')
        }
        const tokens:Tokens = await this.signToken(user.id,user.email);
        
        return {user,tokens};
    }
    async logout(userId:number):Promise<boolean>{
        await this.prisma.user.updateMany({
            where:{
                id:userId,
            },
            data:{
                hashedRT:null
            }
        })
        return true;
    }
    private async signToken(userId:number,email:string):Promise<Tokens>{

        const payload:JwtPayload = {
            sub:userId,
            email:email
        }
        const accessSecret = process.env.JWT_SECRET
        const refreshSecret = process.env.JWT_REFRESH_TOKEN
        const [accessToken,refreshToken] = await Promise.all([
            this.jwt.signAsync(payload,{
                expiresIn:'15m',
                secret:accessSecret
            }),
            this.jwt.signAsync(payload,{
                expiresIn: '28d',
                secret:refreshSecret
            })
            
        ]) 
        await this.updateRtHash(userId,refreshToken);
        return {access_token:accessToken,
            refresh_token:refreshToken};
    }
    async refreshTokens(userId:number,refreshToken:string):Promise<Tokens>{
        const user = await this.prisma.user.findUnique({
            where:{
                id:userId,
            },
            select:{
                id:true,
                email:true,
                hashedRT:true
            }
        })
        if(!user || !refreshToken) throw new ForbiddenException('Access denied');
        console.log('getting RT');
        const rtMatches = await argon.verify(user.hashedRT,refreshToken);
        console.log('RT taken');
        /* if(!rtMatches) throw new ForbiddenException('Access Denied ++++'); */
        const tokens:Tokens = await this.signToken(user.id,user.email);
        return tokens;
    }
    async updateRtHash(userId: number, rt: string): Promise<void> {
        const hash = await argon.hash(rt);
        await this.prisma.user.update({
          where: {
            id: userId,
          },
          data:{
           hashedRT:hash
          }
        });
      }
    async getUserId(userId:number):Promise<number>{
        const user = await this.prisma.user.findUnique({
            where:{
                id:userId
            },
            select:{
                id:true
            }
        })
        console.log(user.id);
        return user.id;
        
    }

    async isUserEmailExist(email:string){
        try{
            const isExist = await this.prisma.user.findUnique({
                where:{
                    email:email
                },
                select:{
                    email:true
                }
            })
            if(!isExist){
                return false
            }
            return true;
        }catch(err){
            throw new BadRequestException(`Is user email exist?`)
        }
    }
}
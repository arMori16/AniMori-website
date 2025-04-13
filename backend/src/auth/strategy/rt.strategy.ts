import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy,ExtractJwt} from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../types/jwtPayload.type';
import { JwtPayloadWithRt } from '../types/jwtPayloadWithRt.type';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy,'jwt-refresh'){
    constructor(config:ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_REFRESH_TOKEN,
            passReqToCallback:true
        })
    }
    
    validate(req:Request,payload:JwtPayload):JwtPayloadWithRt{
        /* const authorizationHeader = req.header('authorization'); */
        const refreshToken = req?.header('authorization')?.replace('Bearer','').trim();

        if(!refreshToken) throw new ForbiddenException('Refresh token malformed');
        console.log('all is good');
        
        return {...payload,refreshToken};
    }
}
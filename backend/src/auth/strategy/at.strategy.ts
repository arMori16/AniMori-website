import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy,ExtractJwt} from 'passport-jwt';
import { JwtPayload } from '../types/jwtPayload.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(private readonly jwtService: JwtService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        })
    }
    async validateToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET
            });
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    validate(payload:JwtPayload){
        return payload;
    }
}
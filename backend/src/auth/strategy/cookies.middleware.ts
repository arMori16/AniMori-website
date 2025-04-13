// src/auth/strategy/cookies.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../types/jwtPayload.type';

@Injectable()
export class CookieMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const accessToken = req.cookies['accessToken'];
        if (accessToken) {
            try {
                const payload = this.jwtService.verify(accessToken) as JwtPayload;
                req.user = payload;
            } catch (e) {
                console.error('Invalid token', e);
            }
        }
        next();
    }
}
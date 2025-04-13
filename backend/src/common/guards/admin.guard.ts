import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AdminGuard extends AuthGuard('jwt'){
    constructor(private reflector:Reflector,private readonly prisma:PrismaService){
        super()
    }
    async canActivate(context:ExecutionContext):Promise<boolean>{
        const isPublic = this.reflector.getAllAndOverride('isPublic',[
            context.getHandler(),
            context.getClass()
        ]);

        if(isPublic) return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            return false;
        }
        try{
            const dbReq = await this.prisma.user.findUnique({
                where:{
                    id:user.sub,
                },
                select:{
                    role:true,
                }
            })
            if(dbReq.role === 'admin'){
                return true;
            }
            return false;
        }catch(err){
            console.error(`Error in the canActive admin: ${err}`);
            
        }
    }
}
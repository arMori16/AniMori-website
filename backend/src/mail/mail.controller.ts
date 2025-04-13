import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { MailService } from "./mail.service";
import { Public } from "src/common/decorators/public.decorator";




@Controller('mail')
export class MailController{
    constructor(private readonly service:MailService){}
    @Public()
    @Post('getMailReq')
    async getMailReq(@Body('mail') mail:string){
        try{
            console.log('ITS MAILREQ',mail)
            const code = String(Math.floor(100000 + Math.random()*900000));
    
            await this.service.sendVerificationCode(mail,code);

            return code;
        }catch(err){
            console.error('Error when trying to send an email message!');
            throw new Error(err);
        }
    }

}
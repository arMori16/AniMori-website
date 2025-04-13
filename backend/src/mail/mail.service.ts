import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from'path';
import Handlebars from "handlebars";
const mjml2html = require('mjml');  // используем require



@Injectable()
export class MailService{
    private transporter;
    constructor(){
        this.transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:465,
            secure:true,
            auth:{
                user:'barasekson67@gmail.com',
                pass:'rzyuekzltcerruoz'
            }
        })
    }
    async generateEmail(code:string){
        const mjmlTemplate = fs.readFileSync(path.join(__dirname,'..','..','..','templates','emailTemplate.mjml'),'utf8');
        const template = Handlebars.compile(mjmlTemplate);
        const mjmlWithCode = template({code})
        const {html} = mjml2html(mjmlWithCode);
        return html;
    }
    async sendVerificationCode(to:string,code:string){
        const htmlContent = await this.generateEmail(code);
        const mailOptions = ({
            from:'"Mori🍃" <barasekson67@gmail.com>',
            to:`${to}`,
            subject:"Verify ✔",
            html:htmlContent
        })
        await this.transporter.sendMail(mailOptions);
        await this.getMailCode(code);
    }
    async getMailCode(code:string){
        return code;
    }
}
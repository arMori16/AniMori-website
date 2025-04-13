import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminGuard } from "src/common/guards/admin.guard";


@Controller('/admin')
export class AdminController{
    constructor(){}
    @UseGuards(AdminGuard)
    @Get('/verify')
    async verify(){
        console.log('Here is verify!!!!!!');
        
        return true;
    }
}
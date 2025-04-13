import { Controller, Get, Post } from "@nestjs/common";
import { RoomService } from "./room.service";
import { GetCurrentUserId } from "src/common/decorators";



@Controller('room')
export class RoomController{
    constructor(private readonly service:RoomService){}
    
}
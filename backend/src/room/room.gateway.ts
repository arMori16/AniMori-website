
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GetCurrentUserId } from "src/common/decorators";
import { RoomService } from "./room.service";
import { UnauthorizedException, UseGuards } from "@nestjs/common";
import { AtGuard } from "src/common/guards";
import { AtStrategy } from "src/auth/strategy/at.strategy";



@WebSocketGateway({cors:true})
export class RoomGateWay implements OnGatewayConnection,OnGatewayDisconnect{
    constructor(private readonly service:RoomService,private readonly atStrategy: AtStrategy){}
    @WebSocketServer()
    server:Server

    async handleConnection(client: Socket) {
        try {
            // Extract token from handshake
            const token = client.handshake.auth?.token;
            if (!token) {
                console.warn(`No token provided for client: ${client.id}`);
                client.disconnect();
                return;
            }
    
            // Use AtStrategy to validate the token
            const payload = await this.atStrategy.validateToken(token); // Assuming you have a method like this in AtStrategy
            const userId = payload?.sub; // Extract userId from payload
            console.log(`This is a user Id: `,userId);
            
            if (!userId) {
                console.warn(`Invalid token for client: ${client.id}`);
                client.disconnect();
                return;
            }
    
            // Optionally store the userId with the socket ID
            client.join(userId);
            (client as any).userId = userId; // Add userId to the socket for later use
            console.log(`Client connected: ${client.id}, userId: ${(client as any).userId}`);
        } catch (err) {
            console.error(`Connection error: ${err.message}`);
            client.disconnect();
        }
    }
    
    @SubscribeMessage('createRoom')
    async handleCreateRoom(@ConnectedSocket() client:Socket,@MessageBody() data:{seriesName: string}){
        const {seriesName} = data;
        const userId = (client as any).userId; // Retrieve userId from the socket
        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }
        const createdRoom = await this.service.handleCreateRoom(userId,seriesName);
        const roomData = {...createdRoom,isHost:true};
        const roomId = String(createdRoom.room.Id);
        client.join(roomId);
        this.server.to(userId).emit('roomCreated',roomData);
        return createdRoom;
    }
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(@ConnectedSocket() client:Socket,@MessageBody() SeriesName:{seriesName:string},@MessageBody() data:{roomCode:string}){
        const {seriesName} = SeriesName;
        console.log(`Join room data: `,SeriesName,data);
        const userId = (client as any).userId; // Retrieve userId from the socket
        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }
        const {roomCode} = data;
        const joinRoom = await this.service.joinRoom(userId,roomCode,seriesName);
        if(joinRoom){
            const roomId = String(joinRoom.RoomId);
            client.join(roomId);
            const roomInfo = await this.service.getUserInfo(userId);
            this.server.to(roomId).emit('joinedRoom',roomInfo);
            console.log(`Client ${userId} joined room: ${roomCode}`);
            return joinRoom;
        }
    }
    async handleDisconnect(@ConnectedSocket() client:Socket) {
        console.log(`Client disconnected: ${(client as any).userId}`);
    }
    @SubscribeMessage('leave')
    async userLeave(@ConnectedSocket() client:Socket){
        const userId = (client as any).userId;
        const leave = await this.service.handleDisconnect(userId);
        client.leave(String(leave.RoomId));
        this.server.to(userId).emit('left');
        console.log(`IT SHOULD WORK!: `,leave.RoomId);
        
        this.server.to(String(leave.RoomId)).emit('left',leave)
    }
    @SubscribeMessage('reconnect')
    async reconnect(@ConnectedSocket() client:Socket){
        const userId = (client as any).userId;
        const roomInfo = await this.service.getUserInfo(userId);
        console.log(`This is reconnect!`);
        client.join(String(roomInfo.hostInfo.room.Id));
        this.server.to(userId).emit('reconnected',roomInfo)
    }

    @SubscribeMessage('playVideo')
    async playVideo(@ConnectedSocket() client:Socket,@MessageBody() data:any){
        this.server.to(String(data.roomInfo.Id)).emit('playVideo',data)
    }
    @SubscribeMessage('episode')
    async changeEpisode(@ConnectedSocket() client:Socket,@MessageBody() data:any){
        console.log(`THIS IS PLAYVIDEO DATA: `,data);
        this.server.to(String(data.roomInfo.Id)).emit('episode',data)
    }
    @SubscribeMessage('handleTimeUpdate')
    async handleTimeUpdate(@ConnectedSocket() client:Socket,@MessageBody() data:any){
        this.server.to(String(data.roomInfo.Id)).emit('handleTimeUpdate',data.time)
    }
}
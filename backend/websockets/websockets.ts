import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import {Server,Socket} from 'socket.io'
import { CommentsService } from "src/comments/comments.service";
import { CommentsDto } from "./comment.dto";


@WebSocketGateway({
    cors:{
        origin:'*'
    }
})
export class CommentsGateway{
    constructor(private readonly commentService:CommentsService){}
    @WebSocketServer()
    server:Server

    @SubscribeMessage('createComment')
    async handleCreateComment(@MessageBody() createCommentDto:CommentsDto,@ConnectedSocket() client:Socket){
        const comment = await this.commentService.createComment(createCommentDto);
        this.server.emit('Comment created!',comment);
        return { event: 'commentCreated', data: comment };;
    }

}

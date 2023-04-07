import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) { }

  @SubscribeMessage('createMessage')
  async create (@MessageBody() createMessageDto: CreateMessageDto, @ConnectedSocket() client: Socket) {
    const message = await this.messagesService.create(createMessageDto, client.id);
    this.server.emit('message', message);
    return message;
  }

  @SubscribeMessage('findAllMessages')
  findAll () {
    return this.messagesService.findAll();
  }

  @SubscribeMessage('join')
  joinRoom (@MessageBody('name') name: string, @ConnectedSocket() client: Socket) {
    return this.messagesService.identify(name, client.id);
  }

  @SubscribeMessage('typing')
  typing (@MessageBody("isTyping") isTyping: boolean, @ConnectedSocket() client: Socket) {
    const name = this.messagesService.getClientName(client.id);
    if (isTyping) {
      client.broadcast.emit("typing", { name, isTyping });
    }
  }
}

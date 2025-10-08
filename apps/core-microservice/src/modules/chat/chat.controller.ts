import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('/api/chat')
export class ChatController {
  constructor(private chatService: ChatService) {}
  @Post(`/create`)
  async createChat(
    @Body() dto: CreateChatDto,
    @Body('chatParticipantsIds') chatParticipantsIds: string[],
  ) {
    return await this.chatService.createChat(dto, chatParticipantsIds);
  }
}

import { Body, Controller, Get, Post } from '@nestjs/common';
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

  @Get(`/allChats/`)
  async getAllChatsOfUser() {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.chatService.getAllChatsOfProfile(profileId);
  }
}

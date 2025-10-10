import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Chat } from '../../common/entities/chatDedicated/chat.entity';
import { ChatParticipant } from '../../common/entities/chatDedicated/chat-participant.entity';

@ApiTags('Operations with chats')
@ApiBearerAuth('access-token')
@Controller('/api/chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @ApiOperation({ summary: 'Creates chat' })
  @ApiResponse({ status: 200, type: Chat })
  @Post(`/create`)
  async createChat(
    @Body() dto: CreateChatDto,
    @Body('chatParticipantsIds') chatParticipantsIds: string[], //the first one should be the creator, he'll become admin
  ) {
    return await this.chatService.createChat(dto, chatParticipantsIds);
  }

  @ApiOperation({ summary: 'Returns all chats of user' })
  @ApiResponse({ status: 200, type: ChatParticipant })
  @Get(`/allChats/`)
  async getAllChatsOfUser() {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.chatService.getAllChatsOfProfile(profileId);
  }

  @ApiOperation({
    summary: 'Returns all information about specific chat and its participants',
  })
  @ApiResponse({ status: 200, type: Chat })
  @Get(`/info/:chatId`)
  async getChatInfo(@Param('chatId') chatId: string) {
    return await this.chatService.getChatInfo(chatId);
  }

  @ApiOperation({ summary: 'Updates chat title' })
  @ApiResponse({ status: 200, type: Chat })
  @Put(`/updateTitle/:chatId`)
  async editChatTitle(
    @Param('chatId') chatId: string,
    @Body('title') title: string,
  ) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return this.chatService.updateChatTitle(chatId, title, profileId);
  }

  @ApiOperation({ summary: 'Deletes participant from chat' })
  @ApiResponse({ status: 200 })
  @Put(`/leave/:chatId`)
  async leaveChat(@Param('chatId') chatId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.chatService.leaveChat(chatId, profileId);
  }
}

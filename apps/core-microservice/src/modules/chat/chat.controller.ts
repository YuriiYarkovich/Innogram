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
import { AddParticipantDto } from './dto/add-participant.dto';

@ApiTags('Operations with chats')
@ApiBearerAuth('access-token')
@Controller('/api/chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @ApiOperation({ summary: 'Creates chat' })
  @ApiResponse({ status: 200, type: Chat })
  @Post(`/create`)
  async createChat(@Body() dto: CreateChatDto) {
    return await this.chatService.createChat(dto);
  }

  @ApiOperation({ summary: 'Returns all chats of user' })
  @ApiResponse({ status: 200, type: ChatParticipant })
  @Get(`/allChatsOfProfile/`)
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
  async editChat(@Param('chatId') chatId: string, @Body() dto: CreateChatDto) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return this.chatService.updateChatTitle(chatId, dto, profileId);
  }

  @ApiOperation({ summary: 'Deletes participant from chat' })
  @ApiResponse({ status: 200 })
  @Put(`/leave/:chatId`)
  async leaveChat(@Param('chatId') chatId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.chatService.leaveChat(chatId, profileId);
  }

  @ApiOperation({ summary: 'Adds participants to chat' })
  @ApiResponse({ status: 200, type: ChatParticipant })
  @Post(`/addParticipant/:chatId`)
  async addParticipant(
    @Param(`chatId`) chatId: string,
    @Body() dto: AddParticipantDto,
  ) {
    return await this.chatService.addChatParticipants(chatId, dto);
  }

  @ApiOperation({ summary: 'Archives chat' })
  @ApiResponse({ status: 200, type: Chat })
  @Put(`/archive/:chatId`)
  async archiveChat(@Param(`chatId`) chatId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.chatService.archiveChat(chatId, profileId);
  }
}

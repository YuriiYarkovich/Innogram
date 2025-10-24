import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Chat } from '../../common/entities/chat/chat.entity';
import { ChatParticipant } from '../../common/entities/chat/chat-participant.entity';
import { AddParticipantDto } from './dto/add-participant.dto';
import { context, CONTEXT_KEYS } from '../../common/cls/request-context';
import { AuthGuard } from '../../common/guards/auth.guard';

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
  @UseGuards(AuthGuard)
  async getAllChatsOfUser() {
    const profileId = context.get(CONTEXT_KEYS.USER).profile_id;
    return await this.chatService.getAllChatsOfProfile(profileId);
  }

  @ApiOperation({
    summary: 'Returns all information about specific chat and its participants',
  })
  @ApiResponse({ status: 200, type: Chat })
  @Get(`/info/:chatId`)
  @UseGuards(AuthGuard)
  async getChatInfo(@Param('chatId') chatId: string) {
    const profileId = context.get(CONTEXT_KEYS.USER).profile_id;
    return await this.chatService.getChatInfo(chatId, profileId);
  }

  @ApiOperation({ summary: 'Updates chat title' })
  @ApiResponse({ status: 200, type: Chat })
  @Put(`/updateTitle/:chatId`)
  @UseGuards(AuthGuard)
  async editChat(@Param('chatId') chatId: string, @Body() dto: CreateChatDto) {
    const profileId = context.get(CONTEXT_KEYS.USER).profile_id;
    return this.chatService.updateChatTitle(chatId, dto, profileId);
  }

  @ApiOperation({ summary: 'Deletes participant from chat' })
  @ApiResponse({ status: 200 })
  @Put(`/leave/:chatId`)
  @UseGuards(AuthGuard)
  async leaveChat(@Param('chatId') chatId: string) {
    const profileId = context.get(CONTEXT_KEYS.USER).profile_id;
    return await this.chatService.leaveChat(chatId, profileId);
  }

  @ApiOperation({ summary: 'Adds participants to chat' })
  @ApiResponse({ status: 200, type: ChatParticipant })
  @Post(`/addParticipant/:chatId`)
  @UseGuards(AuthGuard)
  async addParticipant(
    @Param(`chatId`) chatId: string,
    @Body() dto: AddParticipantDto,
  ) {
    const profileId = context.get(CONTEXT_KEYS.USER).profile_id;
    return await this.chatService.addChatParticipants(chatId, dto, profileId);
  }

  @ApiOperation({ summary: 'Archives chat' })
  @ApiResponse({ status: 200, type: Chat })
  @Put(`/archive/:chatId`)
  @UseGuards(AuthGuard)
  async archiveChat(@Param(`chatId`) chatId: string) {
    const profileId = context.get(CONTEXT_KEYS.USER).profile_id;
    return await this.chatService.archiveChat(chatId, profileId);
  }
}

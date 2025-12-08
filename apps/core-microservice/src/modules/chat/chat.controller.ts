import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { ReturningChatData } from '../../common/types/chat.types';
import { Profile } from '../../common/entities/account/profile.entity';

@ApiTags('Operations with chats')
@ApiBearerAuth('access-token')
@Controller('/api/chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @ApiOperation({ summary: 'Creates chat' })
  @ApiResponse({ status: 200, type: Chat })
  @Post(`/create`)
  @UseGuards(AuthGuard)
  async createChat(@Body() dto: CreateChatDto) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.chatService.createChat(dto, currentProfileId);
  }

  @ApiOperation({ summary: 'Returns all chats of user' })
  @ApiResponse({ status: 200, type: Chat })
  @Get(`/allChatsOfProfile/`)
  @UseGuards(AuthGuard)
  async getAllChatsOfUser(): Promise<ReturningChatData[]> {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.chatService.getAllChatsOfProfile(currentProfileId);
  }

  @ApiOperation({
    summary: 'Returns all information about specific chat and its participants',
  })
  @ApiResponse({ status: 200, type: Chat })
  @Get(`/info/:chatId`)
  @UseGuards(AuthGuard)
  async getChatInfo(@Param('chatId') chatId: string) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.chatService.getChatInfo(chatId, currentProfileId);
  }

  @Get('/findInfoOfPrivate/:receiverId')
  @UseGuards(AuthGuard)
  async getPrivateChatInfo(@Param('receiverId') receiverId: string) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.chatService.getPrivateChatInfo(
      currentProfileId,
      receiverId,
    );
  }

  @ApiOperation({ summary: 'Updates chat title' })
  @ApiResponse({ status: 200, type: Chat })
  @Put(`/updateTitle/:chatId`)
  @UseGuards(AuthGuard)
  async editChat(@Param('chatId') chatId: string, @Body() dto: CreateChatDto) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    if (!dto.title) throw new BadRequestException('Title is not provided!');
    return this.chatService.updateChatTitle(
      chatId,
      dto.title,
      currentProfileId,
    );
  }

  @ApiOperation({ summary: 'Deletes current user from chat' })
  @ApiResponse({ status: 200 })
  @Put(`/leave/:chatId`)
  @UseGuards(AuthGuard)
  async leaveChat(@Param('chatId') chatId: string) {
    const currentpProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.chatService.leaveChat(chatId, currentpProfileId);
  }

  @ApiOperation({ summary: 'Adds participants to chat' })
  @ApiResponse({ status: 200, type: ChatParticipant })
  @Post(`/addParticipant/:chatId`)
  @UseGuards(AuthGuard)
  async addParticipant(
    @Param(`chatId`) chatId: string,
    @Body() dto: AddParticipantDto,
  ) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.chatService.addChatParticipants(
      chatId,
      dto,
      currentProfileId,
    );
  }

  @ApiOperation({ summary: 'Deletes participants from chat' })
  @ApiResponse({ status: 200 })
  @Delete(`/deleteParticipant/:chatId`)
  @UseGuards(AuthGuard)
  async deleteParticipant(
    @Param(`chatId`) chatId: string,
    @Body() body: { participantId: string },
  ) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    await this.chatService.deleteChatParticipant(
      chatId,
      body.participantId,
      currentProfileId,
    );
  }

  @ApiOperation({ summary: 'Returns all participants of the chat' })
  @ApiResponse({ status: 200, type: Profile })
  @Get(`/allParticipant/:chatId`)
  @UseGuards(AuthGuard)
  async allParticipants(@Param(`chatId`) chatId: string) {
    return await this.chatService.getAllChatParticipants(chatId);
  }

  @ApiOperation({ summary: 'Returns subscriptions, who are not yet in chat' })
  @ApiResponse({ status: 200, type: Profile })
  @Get(`/possibleParticipants/:chatId`)
  @UseGuards(AuthGuard)
  async possibleParticipants(@Param(`chatId`) chatId: string) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.chatService.getAllPossibleParticipants(
      chatId,
      currentProfileId,
    );
  }

  @ApiOperation({ summary: 'Gives admin rights to specific users' })
  @ApiResponse({ status: 200 })
  @Post(`/giveAdmin/:participantId`)
  @UseGuards(AuthGuard)
  async giveAdminRights(
    @Param(`participantId`) participantId: string,
    @Body() body: { chatId: string },
  ) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.chatService.giveAdminToChatParticipant(
      body.chatId,
      participantId,
      currentProfileId,
    );
  }

  /*@ApiOperation({ summary: 'Archives chat' })
  @ApiResponse({ status: 200, type: Chat })
  @Put(`/archive/:chatId`)
  @UseGuards(AuthGuard)
  async archiveChat(@Param(`chatId`) chatId: string) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.chatService.archiveChat(chatId, currentProfileId);
  }*/
}

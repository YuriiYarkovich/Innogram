import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Message } from '../../common/entities/chat/message.entity';
import { context, CONTEXT_KEYS } from '../../common/cls/request-context';
import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('Operations with messages')
@ApiBearerAuth('access-token')
@Controller('/api/messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @ApiOperation({ summary: 'Returns all messages of chat' })
  @ApiResponse({ status: 200, type: Message })
  @Get(`/fromChat/:chatId`)
  @UseGuards(AuthGuard)
  async getMessagesFromChat(
    @Param('chatId') chatId: string,
    @Query('lastLoadedMessageCreatedAt') lastLoadedMessageCreatedAt: string,
  ) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.messagesService.getMessagesFromChat(
      currentProfileId,
      chatId,
      lastLoadedMessageCreatedAt,
    );
  }
}

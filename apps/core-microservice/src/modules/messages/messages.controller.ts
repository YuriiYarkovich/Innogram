import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Message } from '../../common/entities/chat/message.entity';
import { EditMessageDto } from './dto/edit-message.dto';
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
    @Body('lastLoadedMessageCreatedAt') lastLoadedMessageCreatedAt: string,
  ) {
    const currentProfileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.messagesService.getMessagesFromChat(
      currentProfileId,
      chatId,
      lastLoadedMessageCreatedAt,
    );
  }

  @ApiOperation({ summary: 'Edits messages' })
  @ApiResponse({ status: 200, type: Message })
  @ApiConsumes('multipart/form-data')
  @Put(`/edit/:messageId`)
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async editMessage(
    @Param('messageId') messageId: string,
    @Body() dto: EditMessageDto,
    @UploadedFiles() files,
  ): Promise<Message | null> {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.messagesService.editMessage(
      messageId,
      dto,
      profileId,
      files,
    );
  }

  @ApiOperation({ summary: 'Deletes messages' })
  @ApiResponse({ status: 200, type: Message })
  @Delete(`/delete/:messageId`)
  @UseGuards(AuthGuard)
  async deleteMessage(@Param('messageId') messageId: string): Promise<Message> {
    const profileId: string = context.get(CONTEXT_KEYS.USER).profileId;
    return await this.messagesService.deleteMessage(messageId, profileId);
  }
}

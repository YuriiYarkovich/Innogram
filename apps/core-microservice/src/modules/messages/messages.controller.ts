import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateMessageDto } from './dto/create-message.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Message } from '../../common/entities/chatDedicated/message.entity';
import { EditMessageDto } from './dto/edit-message.dto';

@ApiTags('Operations with messages')
@ApiBearerAuth('access-token')
@Controller('/api/messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @ApiOperation({ summary: 'Creates message' })
  @ApiResponse({ status: 200, type: Message })
  @ApiConsumes('multipart/form-data')
  @Post(`/create`)
  @UseInterceptors(FilesInterceptor('files'))
  async createMessage(@Body() dto: CreateMessageDto, @UploadedFiles() files) {
    const profileId = '49e602a4-7173-4d54-954b-47687f4e0c8e'; //TODO get from CLS when auth module ready
    return await this.messagesService.createMessage(dto, profileId, files);
  }

  @ApiOperation({ summary: 'Returns all messages of chat' })
  @ApiResponse({ status: 200, type: Message })
  @Get(`/allOfChat/:chatId`)
  async getAllMessagesOfChat(@Param('chatId') chatId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.messagesService.getAllMessagesOfChat(profileId, chatId);
  }

  @ApiOperation({ summary: 'Edits messages' })
  @ApiResponse({ status: 200, type: Message })
  @ApiConsumes('multipart/form-data')
  @Put(`/edit/:messageId`)
  @UseInterceptors(FilesInterceptor('files'))
  async editMessage(
    @Param('messageId') messageId: string,
    @Body() dto: EditMessageDto,
    @UploadedFiles() files,
  ) {
    const profileId = '49e602a4-7173-4d54-954b-47687f4e0c8e'; //TODO get from CLS when auth module ready
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
  async deleteMessage(@Param('messageId') messageId: string) {
    const profileId = '49e602a4-7173-4d54-954b-47687f4e0c8e'; //TODO get from CLS when auth module ready
    return await this.messagesService.deleteMessage(messageId, profileId);
  }
}

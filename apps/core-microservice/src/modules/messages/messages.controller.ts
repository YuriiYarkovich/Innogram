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

@Controller('/api/messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post(`/create`)
  @UseInterceptors(FilesInterceptor('files'))
  async createMessage(@Body() dto: CreateMessageDto, @UploadedFiles() files) {
    const profileId = '49e602a4-7173-4d54-954b-47687f4e0c8e'; //TODO get from CLS when auth module ready
    return await this.messagesService.createMessage(dto, profileId, files);
  }

  @Get(`/allOfChat/:chatId`)
  async getAllMessagesOfChat(@Param('chatId') chatId: string) {
    const profileId = '27b439b8-9bbc-4425-9690-8ecc73dcbc49'; //TODO get from CLS when auth module ready
    return await this.messagesService.getAllMessagesOfChat(profileId, chatId);
  }

  @Put(`/edit/:messageId`)
  @UseInterceptors(FilesInterceptor('files'))
  async editMessage(
    @Param('messageId') messageId: string,
    @Body('content') content: string,
    @UploadedFiles() files,
  ) {
    const profileId = '49e602a4-7173-4d54-954b-47687f4e0c8e'; //TODO get from CLS when auth module ready
    return await this.messagesService.editMessage(
      messageId,
      content,
      profileId,
      files,
    );
  }

  @Delete(`/delete/:messageId`)
  async deleteMessage(@Param('messageId') messageId: string) {
    const profileId = '49e602a4-7173-4d54-954b-47687f4e0c8e'; //TODO get from CLS when auth module ready
    return await this.messagesService.deleteMessage(messageId, profileId);
  }
}

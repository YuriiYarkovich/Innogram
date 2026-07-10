import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpService } from './httpService';

@Module({
  controllers: [AuthController],
  providers: [AuthService, HttpService],
  exports: [AuthService],
})
export class AuthModule {}

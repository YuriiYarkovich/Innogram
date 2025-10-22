import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './repositories/comments.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentLike } from '../../common/entities/commentsDedicated/comment-like.entity';
import { Post } from '../../common/entities/postsDedicated/post.entity';
import { ConfigModule } from '@nestjs/config';
import { Comment } from '../../common/entities/commentsDedicated/comment.entity';
import { PostsModule } from '../posts/posts.module';
import { CommentLikeRepository } from './repositories/comment-like.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository, CommentLikeRepository],
  imports: [
    TypeOrmModule.forFeature([Comment, CommentLike, Post]),
    ConfigModule,
    PostsModule,
    AuthModule,
  ],
})
export class CommentsModule {}

import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './repositories/comments.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentLike } from '../../common/entities/comments/comment-like.entity';
import { Post } from '../../common/entities/posts/post.entity';
import { ConfigModule } from '@nestjs/config';
import { Comment } from '../../common/entities/comments/comment.entity';
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

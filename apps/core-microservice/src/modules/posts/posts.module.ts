import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../common/entities/posts/post.entity';
import { PostsRepository } from './repositories/posts.reposiory';
import { PostAssetRepository } from './repositories/post-asset.repository';
import { MinioModule } from '../minio/minio.module';
import { PostAsset } from '../../common/entities/posts/post-asset.entity';
import { PostLikeRepository } from './repositories/post-like.repository';
import { PostLike } from '../../common/entities/posts/post-like.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    PostAssetRepository,
    PostLikeRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([Post, PostAsset, PostLike]),
    MinioModule,
    AuthModule,
  ],
  exports: [PostsRepository],
})
export class PostsModule {}

import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../common/entities/postsDedicated/post.entity';
import { PostsRepository } from './posts.reposiory';
import { PostAssetRepository } from './post-asset.repository';
import { MinioModule } from '../minio/minio.module';
import { PostAsset } from '../../common/entities/postsDedicated/post-asset.entity';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, PostAssetRepository],
  imports: [TypeOrmModule.forFeature([Post, PostAsset]), MinioModule],
})
export class PostsModule {}

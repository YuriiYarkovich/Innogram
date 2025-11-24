import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLike } from '../../../common/entities/posts/post-like.entity';

@Injectable()
export class PostLikeRepository {
  constructor(
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
  ) {}

  async addLike(postId: string, profileId: string): Promise<PostLike> {
    const like: PostLike = this.postLikeRepository.create({
      postId: postId,
      profileId: profileId,
    });

    await this.postLikeRepository.save(like);

    return like;
  }

  async findLike(postId: string, profileId: string): Promise<PostLike | null> {
    return await this.postLikeRepository.findOne({
      where: {
        postId: postId,
        profileId: profileId,
      },
    });
  }

  async removeLike(
    postId: string,
    profileId: string,
  ): Promise<PostLike | null> {
    const deletedLike: PostLike | null = await this.postLikeRepository.findOne({
      where: { postId: postId, profileId: profileId },
    });

    await this.postLikeRepository.delete({
      postId: postId,
      profileId: profileId,
    });

    return deletedLike;
  }

  async findAllLikesOfPost(postId: string): Promise<PostLike[]> {
    return await this.postLikeRepository.find({
      where: {
        postId: postId,
      },
    });
  }
}

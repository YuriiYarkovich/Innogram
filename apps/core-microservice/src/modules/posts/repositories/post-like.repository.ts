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

  async addLike(postId: string, profileId: string) {
    const like = this.postLikeRepository.create({
      post_id: postId,
      profile_id: profileId,
    });

    await this.postLikeRepository.save(like);

    return like;
  }

  async findLike(postId: string, profileId: string) {
    return await this.postLikeRepository.findOne({
      where: {
        post_id: postId,
        profile_id: profileId,
      },
    });
  }

  async removeLike(postId: string, profileId: string) {
    const deletedLike = await this.postLikeRepository.findOne({
      where: { post_id: postId, profile_id: profileId },
    });

    await this.postLikeRepository.delete({
      post_id: postId,
      profile_id: profileId,
    });

    return deletedLike;
  }

  async findAllLikesOfPost(postId: string) {
    return await this.postLikeRepository.find({
      where: {
        post_id: postId,
      },
    });
  }
}

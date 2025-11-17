import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model , SortOrder} from 'mongoose';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>
    ) {}

    async getAll(orderBy = 'fecha', limit = 10) {
        const sortOptions: { [key: string]: SortOrder } = 
        orderBy === 'likes'
        ? { likes: -1 }
        : { createdAt: -1 };

        return this.postModel
        .find()
        .sort(sortOptions)
        .limit(limit)
        .exec();
    }

    async createPost(data: any) {
        const post = new this.postModel(data);
        return post.save();
    }

    async toggleLike(id: string, username: string) {
        const post = await this.postModel.findById(id);

        if (!post) return null;

        const already = post.likedBy.includes(username);

        if (already) {
        post.likedBy = post.likedBy.filter(u => u !== username);
        post.likes--;
        } else {
        post.likedBy.push(username);
        post.likes++;
        }

        return post.save();
    }

    async deletePost(id: string) {
        return this.postModel.findByIdAndDelete(id);
    }

    async addComment(id: string, comment: any) {
        return this.postModel.findByIdAndUpdate(
        id,
        { $push: { comentarios: comment } },
        { new: true }
        );
    }
}


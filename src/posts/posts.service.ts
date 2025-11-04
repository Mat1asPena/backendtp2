import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostsService {
    constructor(@InjectModel(Post.name) private model: Model<PostDocument>) {}

    async create(post: Partial<Post>) {
        const doc = new this.model(post);
        return doc.save();
    }

    async list(
        filter = {},
        offset = 0,
        limit = 10,
        sort: { [key: string]: 1 | -1 | 'asc' | 'desc' } = { createdAt: -1 }
    ) {
        return this.model.find(filter).sort(sort).skip(offset).limit(limit).exec();
    }

    async incrementLike(id: string) {
        return this.model.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true }).exec();
    }

    async decrementLike(id: string) {
        return this.model.findByIdAndUpdate(id, { $inc: { likes: -1 } }, { new: true }).exec();
    }

    async softDelete(id: string) {
        return this.model.findByIdAndUpdate(id, { activo: false }, { new: true }).exec();
    }
}

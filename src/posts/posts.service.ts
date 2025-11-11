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
        sort: Record<string, 1 | -1> = { createdAt: -1 }
        ) {
        return this.model.find(filter).sort(sort).skip(offset).limit(limit).exec();
    }

    async likePost(id: string, userId: string) {
        const post = await this.model.findById(id);
        if (!post) return null;

        const alreadyLiked = post.likes.some(like => like.toString() === userId);
        if (alreadyLiked) return post; // no duplica likes

        post.likes.push(userId as any);
        return post.save();
    }

    async unlikePost(id: string, userId: string) {
        const post = await this.model.findById(id);
        if (!post) return null;

        const alreadyLiked = post.likes.some(like => like.toString() === userId);
        if (!alreadyLiked) return post; // no hace nada si no lo había likeado

        post.likes = post.likes.filter(like => like.toString() !== userId);
        return post.save();
    }

    async softDelete(id: string, userId: string, userProfile: string) {
        const post = await this.model.findById(id);
        if (!post) return null;

        // Solo autor o admin pueden borrar
        if (post.author !== userId && userProfile !== 'administrador') {
            throw new Error('No autorizado para eliminar esta publicación');
        }

        post.activo = false;
        return post.save();
    }
}

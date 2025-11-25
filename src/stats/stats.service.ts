import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../posts/schemas/post.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class StatsService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    // Total de Usuarios Registrados
    async getTotalUsers() {
        const count = await this.userModel.countDocuments().exec();
        return { totalUsers: count };
    }

    // Top 10 de Publicaciones por Autor
    async getPostsPerUser() {
        return this.postModel.aggregate([
        {
            $group: {
            _id: '$author',
            totalPosts: { $sum: 1 },
            },
        },
        { $sort: { totalPosts: -1 } },
        { $limit: 10 },
        ]).exec();
    }

    // Likes recibidos por día (Data para gráfico)
    async getLikesByDate() {
        return this.postModel.aggregate([
        // Agrupamos por la fecha de creación y sumamos los likes de ese día
        {
            $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalLikes: { $sum: '$likes' },
            },
        },
        { $sort: { _id: 1 } }, // Ordenar por fecha ascendente
        ]).exec();
    }
}
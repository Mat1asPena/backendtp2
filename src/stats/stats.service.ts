import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

    // Métrica 1: Posts por Usuario (Barra) - AHORA FILTRA POR FECHA
    async getPostsPerUser(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return this.postModel.aggregate([
            // Filtro de tiempo por fecha de creación del post
            { $match: { createdAt: { $gte: start, $lte: end } } },
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

    // Métrica 2: Likes por Rango de Tiempo (Línea)
    async getLikesByDate(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return this.postModel.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    totalLikes: { $sum: '$likes' },
                },
            },
            { $sort: { _id: 1 } },
        ]).exec();
    }

    // Métrica 3: Comentarios por Rango de Tiempo (Barra)
    async getCommentsByDate(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return this.postModel.aggregate([
            { $unwind: '$comentarios' },
            { 
                $match: { 
                    'comentarios.fecha': { $gte: start, $lte: end } 
                } 
            },
            { 
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$comentarios.fecha' } },
                    totalComments: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).exec();
    }

    // Métrica 4: Comentarios por Publicación (Torta)
    async getCommentsPerPost(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return this.postModel.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $unwind: '$comentarios' },
            { $group: {
                _id: '$_id',
                titulo: { $first: '$titulo' },
                totalComments: { $sum: 1 }
            }},
            { $sort: { totalComments: -1 } },
            { $limit: 10 }
        ]).exec();
    }

    async getTotalUsers() {
    // Cuenta todos los documentos en la colección de usuarios
    const count = await this.userModel.countDocuments().exec();
    return { totalUsers: count };
    }
}
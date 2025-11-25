import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model, SortOrder } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary'; // Importar Cloudinary
import { ConfigService } from '@nestjs/config'; // Importar ConfigService

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        private config: ConfigService // Inyectar ConfigService
    ) {
        // Configurar Cloudinary aquí también o moverlo a un módulo compartido
        cloudinary.config({
            cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.config.get('CLOUDINARY_API_KEY'),
            api_secret: this.config.get('CLOUDINARY_API_SECRET'),
            secure: true,
        });
    }

    // Método auxiliar para subir imagen (reutilizable)
    private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
        return new Promise((resolve, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream({ folder: 'ecored_posts' }, (error, result) => {
                if (error) return reject(error);
                resolve((result as any).secure_url);
            });
            upload_stream.end(file.buffer);
        });
    }

    async getAll(orderBy = 'fecha', limit = 5, page = 1, author?: string) {
        const sortOptions: { [key: string]: SortOrder } = 
            orderBy === 'likes' ? { likes: -1 } : { createdAt: -1 };
        
        const skip = (page - 1) * limit;

        // Creamos el objeto de filtro
        const filter: any = {};
        if (author) {
            filter.author = author; // Si recibimos autor, filtramos por él
        }

        return this.postModel
            .find(filter) // Pasamos el filtro a Mongoose
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async createPost(data: any, file?: Express.Multer.File) {
        let imagenUrl = '';
        
        if (file) {
            imagenUrl = await this.uploadToCloudinary(file);
        }

        // Crear el post con la URL de la imagen (si existe)
        const post = new this.postModel({
            ...data,
            imagenUrl
        });
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


import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model, Types, SortOrder } from 'mongoose';
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
        const sortOptions: Record<string, 1 | -1> = 
            orderBy === 'likes' ? { likes: -1 } : { createdAt: -1 };
        
        const skip = (page - 1) * limit;
        
        // Filtro inicial
        const matchStage: any = {};
        if (author) matchStage.author = author;

        return this.postModel.aggregate([
            { $match: matchStage },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: limit },
            // 1. Buscamos al usuario que coincida con el 'author' del post
            {
                $lookup: {
                    from: 'users',                // Nombre de la colección de usuarios en Mongo
                    localField: 'author',         // Campo en el Post (nombre de usuario)
                    foreignField: 'nombreUsuario',// Campo en el User
                    as: 'usuario_data'            // Donde guardamos el resultado temporal
                }
            },
            // 2. Desempaquetamos el array (porque lookup devuelve un array)
            {
                $unwind: {
                    path: '$usuario_data',
                    preserveNullAndEmptyArrays: true // Para que no explote si el usuario fue borrado
                }
            },
            // 3. Agregamos el campo 'authorAvatar' al resultado final
            {
                $addFields: {
                    authorAvatar: '$usuario_data.imagenUrl'
                }
            },
            // 4. Limpiamos lo que no sirve (quitamos el objeto usuario_data pesado)
            {
                $project: {
                    usuario_data: 0
                }
            }
        ]).exec();
    }

    async getOne(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('ID de publicación inválido');
        }

        const result = await this.postModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } }, // 1. Filtramos por ID
            {
                $lookup: { // Traemos datos del autor
                    from: 'users',
                    localField: 'author',
                    foreignField: 'nombreUsuario',
                    as: 'usuario_data'
                }
            },
            {
                $unwind: { // Aplanamos el array de usuario
                    path: '$usuario_data',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: { // Ponemos la foto bonita
                    authorAvatar: '$usuario_data.imagenUrl'
                }
            },
            {
                $project: { // Limpiamos basura
                    usuario_data: 0
                }
            }
        ]).exec();

        if (!result || result.length === 0) {
            throw new NotFoundException('Publicación no encontrada');
        }

        return result[0]; // Devolvemos el objeto, no el array
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

    async updateComment(postId: string, commentId: string, username: string, nuevoTexto: string) {
        const post = await this.postModel.findById(postId);
        if (!post) throw new NotFoundException('Publicación no encontrada');

        const comentario = post.comentarios.find((c: any) => c._id.toString() === commentId);
        if (!comentario) throw new NotFoundException('Comentario no encontrado');

        if (comentario.autor !== username) {
            throw new UnauthorizedException('No tienes permiso para editar este comentario');
        }

        // 2. Usar new Types.ObjectId(commentId) para asegurar el match
        return this.postModel.findOneAndUpdate(
            { _id: postId, "comentarios._id": new Types.ObjectId(commentId) }, 
            { 
                $set: { 
                    "comentarios.$.texto": nuevoTexto, 
                    "comentarios.$.modificado": true 
                } 
            },
            { new: true }
        ).exec();
    }

    async getComments(postId: string, page: number, limit: number) {
        const post = await this.postModel.findById(postId, {
            comentarios: { $slice: [-(page * limit), limit] }
        }).exec();
        
        if (!post) throw new NotFoundException('Post not found');

        const fullPost = await this.postModel.findById(postId).select('comentarios').exec();
        if (!fullPost) throw new NotFoundException('Post not found');

        const sortedComments = fullPost.comentarios.sort((a: any, b: any) => 
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        const skip = (page - 1) * limit;
        const paginatedComments = sortedComments.slice(skip, skip + limit);

        return paginatedComments;
    }
}


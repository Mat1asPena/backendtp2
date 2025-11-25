import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class Comentario {
    @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
    _id: Types.ObjectId; // ID único para cada comentario

    @Prop({ required: true })
    autor: string;

    @Prop({ required: true })
    texto: string;

    @Prop({ default: Date.now })
    fecha: Date;

    @Prop({ default: false }) // Campo para el requerimiento
    modificado: boolean;
}
const ComentarioSchema = SchemaFactory.createForClass(Comentario);

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
    @Prop({ required: true })
    titulo: string;

    @Prop({ required: true })
    mensaje: string;

    @Prop()
    imagenUrl?: string;

    @Prop({ default: 0 })
    likes: number;

    @Prop({ required: true })
    author: string;

    @Prop({ type: [String], default: [] })
    likedBy: string[];

    // Usamos el esquema de comentarios aquí
    @Prop({ type: [ComentarioSchema], default: [] })
    comentarios: Comentario[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
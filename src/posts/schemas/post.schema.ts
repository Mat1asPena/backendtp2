import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

    @Prop({ type: Array, default: [] })
    comentarios: any[];
}

export const PostSchema = SchemaFactory.createForClass(Post);


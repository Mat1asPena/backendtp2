import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
    @Prop({ required: true }) titulo: string;
    @Prop({ required: true }) mensaje: string;
    @Prop() imagenUrl?: string;
    @Prop({ default: 0 }) likes: number;
    @Prop({ required: true }) author: string; // nombreUsuario del autor
    @Prop({ default: true }) activo?: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
    @Prop({ required: true }) titulo: string;
    @Prop({ required: true }) mensaje: string;
    @Prop() imagenUrl?: string;
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    likes: Types.ObjectId[];
    @Prop({ required: true }) author: string; // nombreUsuario del autor
    @Prop({ default: true }) activo?: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);

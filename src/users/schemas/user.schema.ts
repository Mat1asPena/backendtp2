import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true }) nombre: string;

    @Prop({ required: true }) apellido: string;

    @Prop({ required: true, unique: true }) correo: string;

    @Prop({ required: true, unique: true }) nombreUsuario: string;

    @Prop({ required: true }) password: string;

    @Prop() fechaNacimiento?: string;

    @Prop() descripcion?: string;

    @Prop({ default: 'usuario' }) perfil?: 'usuario' | 'administrador';

    @Prop() imagenUrl?: string;

    @Prop({ default: true }) habilitado?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private model: Model<UserDocument>,
        private config: ConfigService // Inyectamos ConfigService
    ) {
        // Configurar Cloudinary
        cloudinary.config({
            cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.config.get('CLOUDINARY_API_KEY'),
            api_secret: this.config.get('CLOUDINARY_API_SECRET'),
            secure: true,
        });
    }

    async create(user: Partial<User>) {
        try {
            // Si viene password, hashearla (útil para el admin que crea usuarios)
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
            const doc = new this.model(user);   
            return await doc.save();
        } catch (err: any) {
            if (err.code === 11000) throw new BadRequestException('Correo o nombre de usuario ya en uso');
            throw err;
        }
    }

    async findByEmail(email: string) {
        return this.model.findOne({ correo: email }).exec();
    }

    async findByUsername(username: string) {
        return this.model.findOne({ nombreUsuario: username }).exec();
    }

    async findById(id: string) {
        const u = await this.model.findById(id).exec();
        if (!u) throw new NotFoundException('Usuario no encontrado');
        return u;
    }

    async findByUsernameOrEmail(identifier: string) {
        return this.model.findOne({ $or: [{ correo: identifier }, { nombreUsuario: identifier }] }).exec();
    }

    async findAll() {
        return this.model.find().select('-password').exec(); // Listar todos sin password
    }

    async toggleStatus(id: string, habilitado: boolean) {
        return this.model.findByIdAndUpdate(id, { habilitado }, { new: true }).exec();
    }

    private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
        return new Promise((resolve, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream({ folder: 'ecored_avatars' }, (error, result) => {
                if (error) return reject(error);
                resolve((result as any).secure_url);
            });
            upload_stream.end(file.buffer);
        });
    }

    async update(id: string, updateData: any, file?: Express.Multer.File): Promise<User> {
        // Evitar actualizar datos sensibles directamente aquí si no se desea
        const { password, rol, ...dataToUpdate } = updateData;

        // Si hay archivo, subirlo y actualizar la URL
        if (file) {
            const url = await this.uploadToCloudinary(file);
            dataToUpdate.imagenUrl = url;
        }
        
        const updatedUser = await this.model.findByIdAndUpdate(
            id,
            dataToUpdate,
            { new: true }
        ).exec();

        if (!updatedUser) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return updatedUser;
    }
}

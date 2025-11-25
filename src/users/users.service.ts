import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

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

    async update(id: string, updateData: any): Promise<User> {
        const { password, rol, ...dataToUpdate } = updateData;
        
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

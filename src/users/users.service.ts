import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

    async create(user: Partial<User>) {
        try {
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
}

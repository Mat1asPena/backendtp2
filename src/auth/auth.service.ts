import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
// CAMBIO AQUÍ: Usamos bcryptjs en lugar de bcrypt
import * as bcryptjs from 'bcryptjs'; 
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private config: ConfigService
    ) {
        cloudinary.config({
            cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.config.get('CLOUDINARY_API_KEY'),
            api_secret: this.config.get('CLOUDINARY_API_SECRET'),
            secure: true,
        });
    }

    private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
        return new Promise((resolve, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream({ folder: 'ecored' }, (error, result) => {
                if (error) return reject(error);
                resolve((result as any).secure_url);
            });
            if (file && file.buffer) {
                upload_stream.end(file.buffer);
            } else {
                reject(new Error('No file buffer provided'));
            }
        });
    }

    async register(dto: RegisterDto, file?: Express.Multer.File) {
        const existsEmail = await this.usersService.findByEmail(dto.correo);
        const existsUser = await this.usersService.findByUsername(dto.nombreUsuario);
        if (existsEmail || existsUser) throw new BadRequestException('Correo o nombre de usuario ya en uso');

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(dto.password, salt);

        let imagenUrl: string | undefined = undefined;
        if (file) {
            imagenUrl = await this.uploadToCloudinary(file);
        }

        const userObj: any = {
            nombre: dto.nombre,
            apellido: dto.apellido,
            correo: dto.correo,
            nombreUsuario: dto.nombreUsuario,
            password: hash,
            fechaNacimiento: dto.fechaNacimiento,
            descripcion: dto.descripcion,
            perfil: dto.perfil || 'usuario',
            imagenUrl,
        };

        const created = await this.usersService.create(userObj);
        const createdObj = created.toObject ? created.toObject() : created;
        createdObj.password = '';

        const token = this.jwtService.sign({
            sub: createdObj._id,
            nombreUsuario: createdObj.nombreUsuario,
            perfil: createdObj.perfil,
        });

        return { statusCode: 201, token, user: createdObj };
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByUsernameOrEmail(dto.usernameOrEmail);
        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        // bcryptjs usa la misma API, así que compare funciona igual
        const match = await bcryptjs.compare(dto.password, (user as any).password);
        if (!match) throw new UnauthorizedException('Credenciales inválidas');

        if ((user as any).habilitado === false) throw new UnauthorizedException('Usuario deshabilitado');

        const userObj = (user as any).toObject ? (user as any).toObject() : user;
        delete userObj.password;

        const token = this.jwtService.sign({
            sub: userObj._id,
            nombreUsuario: userObj.nombreUsuario,
            perfil: userObj.perfil,
        });

        return { statusCode: 200, token, user: userObj };
    }
}
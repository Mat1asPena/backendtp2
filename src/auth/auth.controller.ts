import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) {}

    @Post('register')
    @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() }))
    async register(@Body() body: RegisterDto, @UploadedFile() file?: Express.Multer.File) {
        console.log('📩 Datos recibidos en el backend:', body);
        console.log('📸 Imagen recibida:', file?.originalname);
        return this.auth.register(body, file);
    }

    @Post('login')
    async login(@Body() body: LoginDto) {
        return this.auth.login(body);
    }
}

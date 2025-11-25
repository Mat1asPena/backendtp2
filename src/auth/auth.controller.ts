import { Body, Controller, Post, UploadedFile, UseInterceptors, Get, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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
        console.log('🔑 Intento de login con:', body);
        return this.auth.login(body);
    }

    @Get('seed')
    async seedTestUser() {
        console.log('⚠️  Creando usuario de prueba...');
        return this.auth.seedTestUser();
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    refresh(@Req() req) {
        // El guard ya validó el token actual, generamos uno nuevo
        const user = req.user;
        return this.auth.login({ usernameOrEmail: user.nombreUsuario, password: '' }); // Truco: flag 'isRefresh'
    }

    @Post('authorize')
    @UseGuards(JwtAuthGuard)
    authorize(@Req() req) {
        // Si pasa el Guard, el token es válido
        return { valid: true, user: req.user };
    }
}

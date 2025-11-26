import { Controller, Get, Put, Body, UseGuards, Request, Param, Post, Delete, UnauthorizedException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    // Endpoint para Editar Perfil
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @UseInterceptors(FileInterceptor('imagen')) // Interceptar archivo 'imagen'
    async updateUser(
        @Param('id') id: string, 
        @Body() updateData: any,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.usersService.update(id, updateData, file);
    }

    // --- SPRINT 4: SOLO ADMIN ---
    
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllUsers(@Request() req) {
        this.checkAdmin(req.user);
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('imagen')) 
    async createUser(
        @Request() req, 
        @Body() userData: any,
        @UploadedFile() file?: Express.Multer.File 
    ) {
        this.checkAdmin(req.user);
        // Llamamos a un nuevo método en el servicio para manejar la creación con archivo
        return this.usersService.createAdminUser(userData, file); 
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id') // Baja lógica (Deshabilitar)
    async disableUser(@Request() req, @Param('id') id: string) {
        this.checkAdmin(req.user);
        return this.usersService.toggleStatus(id, false);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/restore') // Alta lógica (Habilitar)
    async enableUser(@Request() req, @Param('id') id: string) {
        this.checkAdmin(req.user);
        return this.usersService.toggleStatus(id, true);
    }

    private checkAdmin(user: any) {
        if (user.perfil !== 'administrador') throw new UnauthorizedException('Requiere rol de administrador');
    }
}
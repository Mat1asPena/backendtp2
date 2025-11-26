import { Controller, Get, UseGuards, Req, UnauthorizedException, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    private checkAdmin(user: any) {
        if (user.perfil !== 'administrador') {
        throw new UnauthorizedException('Acceso restringido: Se requiere rol de administrador');
        }
    }

    // Rutinas para generar fechas por defecto si no vienen en el query
    private getDefaultDates(days = 30) {
        const today = new Date();
        const ago = new Date(today);
        ago.setDate(today.getDate() - days);
        return { 
            startDate: ago.toISOString(), 
            endDate: today.toISOString() 
        };
    }

    // 1. Posts por usuario (Ahora acepta filtro de tiempo)
    @Get('posts-per-user')
    async getPostsPerUser(
        @Req() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        this.checkAdmin(req.user);
        const { startDate: defStart, endDate: defEnd } = this.getDefaultDates(30);
        return this.statsService.getPostsPerUser(startDate || defStart, endDate || defEnd);
    }

    // 2. Likes por fecha
    @Get('likes-by-date')
    async getLikesByDate(
        @Req() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        this.checkAdmin(req.user);
        const { startDate: defStart, endDate: defEnd } = this.getDefaultDates(30);
        return this.statsService.getLikesByDate(startDate || defStart, endDate || defEnd);
    }

    // 3. Comentarios por fecha
    @Get('comments-by-date')
    async getCommentsByDate(
        @Req() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        this.checkAdmin(req.user);
        const { startDate: defStart, endDate: defEnd } = this.getDefaultDates(30);
        return this.statsService.getCommentsByDate(startDate || defStart, endDate || defEnd);
    }

    // 4. Comentarios por publicación (Torta)
    @Get('comments-per-post')
    async getCommentsPerPost(
        @Req() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        this.checkAdmin(req.user);
        const { startDate: defStart, endDate: defEnd } = this.getDefaultDates(90);
        return this.statsService.getCommentsPerPost(startDate || defStart, endDate || defEnd);
    }

    @Get('total-users')
    async getTotalUsers(@Req() req) {
        this.checkAdmin(req.user);
        return this.statsService.getTotalUsers();
    }
}
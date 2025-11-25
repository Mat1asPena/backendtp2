import { Controller, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    private checkAdmin(user: any) {
        if (user.rol !== 'administrador') {
        throw new UnauthorizedException('Acceso restringido: Se requiere rol de administrador');
        }
    }

    @Get('total-users')
    async getTotalUsers(@Req() req) {
        this.checkAdmin(req.user);
        return this.statsService.getTotalUsers();
    }
    
    @Get('posts-per-user')
    async getPostsPerUser(@Req() req) {
        this.checkAdmin(req.user);
        return this.statsService.getPostsPerUser();
    }

    @Get('likes-by-date')
    async getLikesByDate(@Req() req) {
        this.checkAdmin(req.user);
        return this.statsService.getLikesByDate();
    }
}
import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // Importar FileInterceptor
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private posts: PostsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('imagen')) // Interceptar el campo 'imagen'
    create(@Req() req, @Body() body, @UploadedFile() file?: Express.Multer.File) {
        const user = req.user;
        return this.posts.createPost({
            ...body,
            author: user.username,
        }, file); // Pasamos el archivo al servicio
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAll(
        @Query('orderBy') orderBy = 'fecha',
        @Query('limit') limit = 5,
        @Query('page') page = 1 // Recibimos la página
    ) {
        return this.posts.getAll(orderBy, Number(limit), Number(page));
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/like')
    toggleLike(@Param('id') id: string, @Req() req) {
        return this.posts.toggleLike(id, req.user.username);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.posts.deletePost(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/comentarios')
    addComment(@Param('id') id: string, @Body() body) {
        return this.posts.addComment(id, body);
    }
}

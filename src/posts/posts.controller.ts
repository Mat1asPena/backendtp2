import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards, Patch } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private posts: PostsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req, @Body() body) {
        const user = req.user;
        return this.posts.createPost({
            ...body,
            author: user.username,
    });
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAll(
    @Query('orderBy') orderBy = 'fecha',
    @Query('limit') limit = 10
    ) {
        return this.posts.getAll(orderBy, limit);
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

<<<<<<< HEAD
import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards, Patch } from '@nestjs/common';
=======
import { Body, Controller, Delete, Get, Param, Post, Query, Req, Request } from '@nestjs/common';
>>>>>>> parent of 041f1ae (backend sprint 2 pulido)
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
    constructor(private posts: PostsService) {}

    @Post()
<<<<<<< HEAD
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
=======
    create(@Body() body: any) {
        return this.posts.create(body);
    }

    @Get()
    list(
        @Query('offset') offset = '0',
        @Query('limit') limit = '10',
        @Query('order') order = 'fecha',
        @Query('user') user?: string,
    ) {
        const off = parseInt(offset, 10) || 0;
        const lim = parseInt(limit, 10) || 10;
        const sort: Record<string, 1 | -1> = order === 'likes' ? { likes: -1 } : { createdAt: -1 };
        const filter: any = { activo: true };
        if (user) filter.author = user;
        return this.posts.list(filter, off, lim, sort);
    }

    @Post(':id/like')
    like(@Param('id') id: string, @Req() req: any) {
        return this.posts.likePost(id, req.user.id);
    }

    @Delete(':id/like')
    unlike(@Param('id') id: string, @Req() req: any) {
        return this.posts.unlikePost(id, req.user.id);
>>>>>>> parent of 041f1ae (backend sprint 2 pulido)
    }

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

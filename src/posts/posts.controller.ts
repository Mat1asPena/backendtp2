import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
    constructor(private posts: PostsService) {}

    @Post()
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
        const sort: { [key: string]: 1 | -1 | 'asc' | 'desc' } = order === 'likes' ? { likes: -1 } : { createdAt: -1 };
        const filter: any = { activo: true };
        if (user) filter.author = user;
        return this.posts.list(filter, off, lim, sort);
    }

    @Post(':id/like')
    like(@Param('id') id: string) {
        return this.posts.incrementLike(id);
    }

    @Delete(':id/like')
    unlike(@Param('id') id: string) {
        return this.posts.decrementLike(id);
    }

    @Delete(':id')
    softDelete(@Param('id') id: string) {
        return this.posts.softDelete(id);
    }
}

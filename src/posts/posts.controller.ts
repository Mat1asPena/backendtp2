import { Body, Controller, Delete, Get, Param, Post, Query, Req, Request } from '@nestjs/common';
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
    }

    @Delete(':id')
    softDelete(@Param('id') id: string, @Req() req: any) {
        return this.posts.softDelete(id, req.user.id, req.user.profile);
    }
}

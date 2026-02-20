import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtUser } from '../auth/strategies/jwt.strategy';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { BookmarksService } from './bookmarks.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post('bookmarks')
  async toggle(@CurrentUser() user: JwtUser, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.toggle(user.id, dto);
  }

  @Get('users/me/bookmarks')
  async findMyBookmarks(
    @CurrentUser() user: JwtUser,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.bookmarksService.findMyBookmarks(user.id, limit, cursor);
  }
}

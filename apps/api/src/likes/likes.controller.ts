import { Controller, Param, Post, UseGuards } from '@nestjs/common';

import { JwtUser } from '../auth/strategies/jwt.strategy';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LikesService } from './likes.service';

@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reviews/:reviewId/likes')
  async toggle(@Param('reviewId') reviewId: string, @CurrentUser() user: JwtUser) {
    return this.likesService.toggle(reviewId, user.id);
  }
}

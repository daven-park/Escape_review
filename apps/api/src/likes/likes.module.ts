import { Module } from '@nestjs/common';

import { LikesController } from './likes.controller';
import { LikesRepository } from './likes.repository';
import { LikesService } from './likes.service';

@Module({
  controllers: [LikesController],
  providers: [LikesService, LikesRepository],
})
export class LikesModule {}

import { Module } from '@nestjs/common';

import { RegionsController } from './regions.controller';
import { RegionsRepository } from './regions.repository';
import { RegionsService } from './regions.service';

@Module({
  controllers: [RegionsController],
  providers: [RegionsService, RegionsRepository],
})
export class RegionsModule {}

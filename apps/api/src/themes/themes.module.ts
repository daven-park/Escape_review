import { Module } from '@nestjs/common';

import { ThemesController } from './themes.controller';
import { ThemesRepository } from './themes.repository';
import { ThemesService } from './themes.service';

@Module({
  controllers: [ThemesController],
  providers: [ThemesService, ThemesRepository],
})
export class ThemesModule {}

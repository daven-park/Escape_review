import { Controller, Get, Param, Query } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { QueryThemesDto } from './dto/query-themes.dto';
import { ThemesService } from './themes.service';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryThemesDto) {
    return this.themesService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.themesService.findById(id);
  }
}

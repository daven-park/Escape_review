import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { RegionsService } from './regions.service';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Public()
  @Get()
  async findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.regionsService.findAll(limit, cursor);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.regionsService.findById(id);
  }
}

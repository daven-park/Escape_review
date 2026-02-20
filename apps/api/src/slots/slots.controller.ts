import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { QuerySlotsDto } from './dto/query-slots.dto';
import { SlotsService } from './slots.service';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Public()
  @Get()
  async findByThemeAndDate(@Query() query: QuerySlotsDto) {
    return this.slotsService.findByThemeAndDate(query);
  }
}

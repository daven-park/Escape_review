import { Controller, Get, Param, Query } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { QueryStoresDto } from './dto/query-stores.dto';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryStoresDto) {
    return this.storesService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.storesService.findById(id);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Public } from '../common/decorators/public.decorator';
import { SearchService, SearchType } from './search.service';

const SEARCH_TYPES = ['theme', 'store', 'all'] as const;

class QuerySearchDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  q!: string;

  @IsOptional()
  @IsIn(SEARCH_TYPES)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  type?: SearchType;
}

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  async search(@Query() query: QuerySearchDto) {
    return this.searchService.search(query.q, query.type ?? 'all');
  }
}

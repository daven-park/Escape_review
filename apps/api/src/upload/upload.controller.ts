import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

import { JwtUser } from '../auth/strategies/jwt.strategy';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UploadService, UploadType } from './upload.service';

const UPLOAD_TYPES = ['review'] as const;

class QueryPresignDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(UPLOAD_TYPES)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  type!: UploadType;
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('presign')
  async presign(@CurrentUser() user: JwtUser, @Query() query: QueryPresignDto) {
    return this.uploadService.createPresignedUploadUrl(user.id, query.type);
  }
}

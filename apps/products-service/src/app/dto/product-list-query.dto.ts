import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CrudListQueryDto } from 'geometry-sdk/adapters';

export class ProductListQueryDto extends CrudListQueryDto {
  @ApiPropertyOptional({ enum: ['true', 'false'] })
  @IsOptional()
  @IsIn(['true', 'false'])
  active?: 'true' | 'false';
}

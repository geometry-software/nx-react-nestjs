import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CrudListQueryDto } from 'geometry-sdk/adapters';
import { InvoiceStatus } from '../entities/invoice.entity';

export class InvoiceListQueryDto extends CrudListQueryDto {
  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}

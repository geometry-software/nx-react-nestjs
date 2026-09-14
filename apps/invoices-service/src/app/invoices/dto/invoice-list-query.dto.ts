import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CrudListQueryDto } from '@nx-react-nestjs/backend-utils';
import { invoiceStatuses, type InvoiceStatus } from '../entities/invoice.entity';

export class InvoiceListQueryDto extends CrudListQueryDto {
  @ApiPropertyOptional({ enum: invoiceStatuses })
  @IsOptional()
  @IsIn(invoiceStatuses)
  status?: InvoiceStatus;
}

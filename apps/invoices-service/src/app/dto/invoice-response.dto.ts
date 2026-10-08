import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto, type PaginatedResult } from 'geometry-sdk/adapters';
import { Invoice } from '../entities/invoice.entity';

export class InvoicePageResponseDto implements PaginatedResult<Invoice> {
  @ApiProperty({ type: [Invoice] })
  data!: Invoice[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class InvoiceListResponseDto {
  @ApiProperty({ type: [Invoice] })
  data!: Invoice[];
}

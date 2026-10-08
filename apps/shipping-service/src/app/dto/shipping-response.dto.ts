import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto, type PaginatedResult } from 'geometry-sdk/adapters';
import { Shipment } from '../entities/shipment.entity';

export class ShipmentPageResponseDto implements PaginatedResult<Shipment> {
  @ApiProperty({ type: [Shipment] })
  data!: Shipment[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { CrudListQueryDto } from 'geometry-sdk/adapters';
import { IsIn, IsOptional } from 'class-validator';
import {
  shipmentStatuses,
  type ShipmentStatus,
} from '../entities/shipment.entity';

export class ShipmentListQueryDto extends CrudListQueryDto {
  @ApiPropertyOptional({ enum: shipmentStatuses })
  @IsOptional()
  @IsIn(shipmentStatuses)
  status?: ShipmentStatus;
}

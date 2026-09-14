import { ApiPropertyOptional } from '@nestjs/swagger';
import { CrudListQueryDto } from '@nx-react-nestjs/backend-utils';
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

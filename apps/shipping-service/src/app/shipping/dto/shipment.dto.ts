import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ShipmentRecipientDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  address!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  city!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  country!: string;
}

export class CreateShipmentDto {
  @ApiProperty({ description: 'User who prepares the shipment' })
  @IsString()
  @MinLength(1)
  createdByUserId!: string;

  @ApiProperty({ type: ShipmentRecipientDto })
  @ValidateNested()
  @Type(() => ShipmentRecipientDto)
  recipient!: ShipmentRecipientDto;

  @ApiProperty({ type: [String], description: 'Confirmed invoices to ship' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  invoiceIds!: string[];
}

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {}

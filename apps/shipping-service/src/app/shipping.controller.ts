import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BulkDeleteDto, BulkDeleteResultDto, DeleteResultDto } from 'geometry-sdk/adapters';
import { ShipmentListQueryDto } from './dto/shipment-list-query.dto';
import { CreateShipmentDto, UpdateShipmentDto } from './dto/shipment.dto';
import { ShipmentPageResponseDto } from './dto/shipping-response.dto';
import { Shipment } from './entities/shipment.entity';
import { ShippingService } from './shipping.service';

@ApiTags('shipping')
@Controller('shippings')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  @ApiOperation({ summary: 'List shipments with filters and pagination' })
  @ApiOkResponse({ description: 'Paginated shipments', type: ShipmentPageResponseDto })
  public findAll(@Query() query: ShipmentListQueryDto): Promise<ShipmentPageResponseDto> {
    return this.shippingService.findPage(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment by id' })
  @ApiOkResponse({ type: Shipment })
  public findOne(@Param('id') id: string): Promise<Shipment> {
    return this.shippingService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a shipment from products' })
  @ApiCreatedResponse({ type: Shipment })
  public create(@Body() dto: CreateShipmentDto): Promise<Shipment> {
    return this.shippingService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a shipment' })
  @ApiOkResponse({ type: Shipment })
  public update(@Param('id') id: string, @Body() dto: UpdateShipmentDto): Promise<Shipment> {
    return this.shippingService.update(id, dto);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple shipments' })
  @ApiOkResponse({ description: 'Number of deleted shipments', type: BulkDeleteResultDto })
  public removeMany(@Body() dto: BulkDeleteDto): Promise<BulkDeleteResultDto> {
    return this.shippingService.removeMany(dto.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shipment' })
  @ApiOkResponse({ description: 'Deleted', type: DeleteResultDto })
  public remove(@Param('id') id: string): Promise<DeleteResultDto> {
    return this.shippingService.remove(id);
  }
}

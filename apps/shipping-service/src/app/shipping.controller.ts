import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BulkDeleteDto } from 'geometry-sdk/adapters';
import { ShipmentListQueryDto } from './dto/shipment-list-query.dto';
import { CreateShipmentDto, UpdateShipmentDto } from './dto/shipment.dto';
import { Shipment } from './entities/shipment.entity';
import { ShippingService } from './shipping.service';

@ApiTags('shipping')
@Controller('shippings')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  @ApiOperation({ summary: 'List shipments with filters and pagination' })
  @ApiOkResponse({ description: 'Paginated shipments' })
  findAll(@Query() query: ShipmentListQueryDto) {
    return this.shippingService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment by id' })
  @ApiOkResponse({ type: Shipment })
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a shipment from products' })
  @ApiCreatedResponse({ type: Shipment })
  create(@Body() dto: CreateShipmentDto) {
    return this.shippingService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a shipment' })
  @ApiOkResponse({ type: Shipment })
  update(@Param('id') id: string, @Body() dto: UpdateShipmentDto) {
    return this.shippingService.update(id, dto);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple shipments' })
  @ApiOkResponse({ description: 'Number of deleted shipments' })
  removeMany(@Body() dto: BulkDeleteDto) {
    return this.shippingService.removeMany(dto.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shipment' })
  @ApiOkResponse({ description: 'Deleted' })
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }
}

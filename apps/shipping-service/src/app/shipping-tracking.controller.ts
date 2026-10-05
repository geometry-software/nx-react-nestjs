import { Controller, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Shipment } from './entities/shipment.entity';
import { ShippingService } from './shipping.service';

@ApiTags('shipping tracking')
@Controller('shippings')
export class ShippingTrackingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post(':id/tracking/refresh')
  @ApiOperation({
    summary: 'Refresh tracking from Dummy Package Place Service',
  })
  @ApiOkResponse({ type: Shipment })
  refreshTracking(@Param('id') id: string) {
    return this.shippingService.refreshTracking(id);
  }
}


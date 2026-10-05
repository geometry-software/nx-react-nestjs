import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeographyPort } from './integrations/ports/geography.port';

@ApiTags('shipping locations')
@Controller('locations')
export class LocationsController {
  constructor(@Inject(GeographyPort) private readonly geography: GeographyPort) {}

  @Get('countries')
  @ApiOperation({ summary: 'List countries for the shipment address' })
  @ApiOkResponse({ description: 'Countries sorted by name' })
  listCountries() {
    return this.geography.listCountries();
  }

  @Get('cities')
  @ApiOperation({ summary: 'Find cities in the selected country' })
  @ApiQuery({ name: 'country', description: 'ISO alpha-2 country code' })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ description: 'Matching cities' })
  listCities(
    @Query('country') country: string,
    @Query('search') search?: string,
  ) {
    return this.geography.listCities(country, search);
  }
}


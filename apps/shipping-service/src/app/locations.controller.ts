import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeographyPort } from './integrations/ports/geography.port';
import { CityLocationDto, CountryLocationDto } from './dto/location-response.dto';

@ApiTags('shipping locations')
@Controller('locations')
export class LocationsController {
  constructor(@Inject(GeographyPort) private readonly geography: GeographyPort) {}

  @Get('countries')
  @ApiOperation({ summary: 'List countries for the shipment address' })
  @ApiOkResponse({ description: 'Countries sorted by name', type: [CountryLocationDto] })
  public listCountries(): Promise<CountryLocationDto[]> {
    return this.geography.listCountries();
  }

  @Get('cities')
  @ApiOperation({ summary: 'Find cities in the selected country' })
  @ApiQuery({ name: 'country', description: 'ISO alpha-2 country code' })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ description: 'Matching cities', type: [CityLocationDto] })
  public listCities(
    @Query('country') country: string,
    @Query('search') search?: string,
  ): Promise<CityLocationDto[]> {
    return this.geography.listCities(country, search);
  }
}

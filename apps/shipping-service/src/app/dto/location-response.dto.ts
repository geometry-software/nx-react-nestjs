import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CityLocation, CountryLocation } from '../integrations/ports/geography.port';

export class CountryLocationDto implements CountryLocation {
  @ApiProperty({ example: 'US' })
  code!: string;

  @ApiProperty({ example: 'United States' })
  name!: string;

  @ApiPropertyOptional()
  flag?: string;
}

export class CityLocationDto implements CityLocation {
  @ApiProperty({ example: 'New York' })
  name!: string;
}

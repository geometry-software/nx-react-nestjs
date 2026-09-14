import { Injectable } from '@nestjs/common';
import { ExternalHttpClient } from '@nx-react-nestjs/backend-utils';
import {
  type CityLocation,
  type CountryLocation,
  GeographyPort,
} from '../ports/geography.port';

type CountriesDevCountry = {
  name?: unknown;
  alpha2Code?: unknown;
  flag?: unknown;
};

type CountriesDevCity = {
  name?: unknown;
};

@Injectable()
export class CountriesDevClient implements GeographyPort {
  private countries?: Promise<CountryLocation[]>;

  constructor(
    private readonly http: ExternalHttpClient,
  ) {}

  listCountries(): Promise<CountryLocation[]> {
    this.countries ??= this.request<unknown[]>(
      '/countries?fields=name,alpha2Code,flag&sort=name',
    ).then((items) =>
      items.flatMap((item): CountryLocation[] => {
        const country = item as CountriesDevCountry;
        if (
          typeof country.name !== 'string' ||
          typeof country.alpha2Code !== 'string'
        ) {
          return [];
        }
        return [
          {
            code: country.alpha2Code,
            name: country.name,
            ...(typeof country.flag === 'string' ? { flag: country.flag } : {}),
          },
        ];
      }),
    );
    return this.countries;
  }

  async listCities(
    countryCode: string,
    search?: string,
  ): Promise<CityLocation[]> {
    const query = new URLSearchParams({ country: countryCode, limit: '50' });
    if (search?.trim()) query.set('q', search.trim());
    const items = await this.request<unknown[]>(`/cities?${query}`);
    return items.flatMap((item): CityLocation[] => {
      const city = item as CountriesDevCity;
      return typeof city.name === 'string' ? [{ name: city.name }] : [];
    });
  }

  private async request<T>(path: string): Promise<T> {
    return this.http.execute<T>({
      provider: 'countries.dev',
      url: `https://countries.dev${path}`,
      retry: { attempts: 3, baseDelayMs: 200 },
    });
  }
}

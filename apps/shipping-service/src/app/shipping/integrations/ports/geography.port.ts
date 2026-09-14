export type CountryLocation = {
  code: string;
  name: string;
  flag?: string;
};

export type CityLocation = {
  name: string;
};

export abstract class GeographyPort {
  abstract listCountries(): Promise<CountryLocation[]>;
  abstract listCities(countryCode: string, search?: string): Promise<CityLocation[]>;
}

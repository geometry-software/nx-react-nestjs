import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto, type PaginatedResult } from 'geometry-sdk/adapters';
import { Product } from '../entities/product.entity';

export class ProductPageResponseDto implements PaginatedResult<Product> {
  @ApiProperty({ type: [Product] })
  data!: Product[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class ProductListResponseDto {
  @ApiProperty({ type: [Product] })
  data!: Product[];
}

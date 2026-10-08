import { ApiProperty } from '@nestjs/swagger';
import type { BulkDeleteResult, PaginationMeta } from '../../core/api.js';

/** Pagination information returned by collection list endpoints. */
export class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({ minimum: 1 })
  page!: number;

  @ApiProperty({ minimum: 1 })
  limit!: number;

  @ApiProperty({ minimum: 0 })
  total!: number;
}

/** Result of deleting one record. */
export class DeleteResultDto {
  @ApiProperty({ example: true })
  deleted!: true;
}

/** Result of deleting multiple records. */
export class BulkDeleteResultDto implements BulkDeleteResult {
  @ApiProperty({ minimum: 0 })
  deleted!: number;
}

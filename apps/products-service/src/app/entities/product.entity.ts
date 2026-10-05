import { ApiProperty } from '@nestjs/swagger';
import type { EntityId, MongoCollectionProviderModel } from 'geometry-sdk/adapters';

export class Product implements MongoCollectionProviderModel {
  @ApiProperty({ type: String })
  id!: EntityId;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty({ minimum: 0 })
  quantity!: number;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

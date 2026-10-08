import { ApiProperty } from '@nestjs/swagger';
import type { MongoDbAdapterModel } from 'geometry-sdk/adapters';

export class Product implements MongoDbAdapterModel {
  @ApiProperty({ type: String })
  id!: string;

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

import { ApiProperty } from '@nestjs/swagger';
import type { MongoDbAdapterModel } from 'geometry-sdk/adapters';
import type { UserRole } from '../dto/user.dto';

export class User implements MongoDbAdapterModel {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['admin', 'manager', 'viewer'] })
  role!: UserRole;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

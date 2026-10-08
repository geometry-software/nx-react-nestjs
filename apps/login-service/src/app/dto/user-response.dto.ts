import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto, type PaginatedResult } from 'geometry-sdk/adapters';
import { User } from '../entities/user.entity';

export class UserPageResponseDto implements PaginatedResult<User> {
  @ApiProperty({ type: [User] })
  data!: User[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

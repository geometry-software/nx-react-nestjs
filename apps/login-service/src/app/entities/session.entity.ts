import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Session {
  @ApiProperty({ type: String })
  id!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  userId!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ writeOnly: true, nullable: true })
  passwordHash?: string | null;

  @ApiPropertyOptional({ nullable: true })
  firebaseUid?: string | null;

  @ApiPropertyOptional({ writeOnly: true, nullable: true })
  firebaseIdToken?: string | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  verifiedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

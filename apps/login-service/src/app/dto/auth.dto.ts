import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { USER_ROLES, type UserRole } from './user.dto';
import type { FirebaseSocialProvider } from 'geometry-sdk/adapters';

export const SOCIAL_PROVIDERS = ['google', 'facebook', 'github'] as const satisfies readonly FirebaseSocialProvider[];

export class SocialLoginDto {
  @ApiProperty({ enum: SOCIAL_PROVIDERS })
  @IsIn(SOCIAL_PROVIDERS)
  provider!: FirebaseSocialProvider;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  idToken?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  accessToken?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'demo@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({ description: 'Anonymous Firebase ID token created by the browser' })
  @IsString()
  @MinLength(1)
  firebaseIdToken!: string;

  @ApiProperty({ example: 'Demo User' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: USER_ROLES })
  @IsIn(USER_ROLES)
  role!: UserRole;

  @ApiProperty({ required: false, example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;
}

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'demo@example.com' })
  email!: string;

  @ApiProperty({ example: 'Demo User' })
  name!: string;

  @ApiProperty({ enum: USER_ROLES })
  role!: UserRole;
}

export class AuthResponseDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty({ type: AuthUserDto }) user!: AuthUserDto;
}

export class PreparedSessionDto {
  @ApiProperty() uid!: string;
  @ApiProperty() created!: boolean;
}

export class PrepareSessionDto {
  @ApiProperty({ description: 'Anonymous Firebase ID token created by the browser' })
  @IsString()
  @MinLength(1)
  idToken!: string;
}

export class SocialIdentityDto {
  @ApiProperty({ enum: SOCIAL_PROVIDERS }) provider!: FirebaseSocialProvider;
  @ApiProperty() uid!: string;
  @ApiProperty() idToken!: string;
}

export class EmailVerificationResponseDto {
  @ApiProperty({ enum: ['ok'] })
  status!: 'ok';
}

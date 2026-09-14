import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
export class LoginDto {
  @ApiProperty({ example: 'demo@example.com' }) @IsEmail() email!: string;
  @ApiProperty({ minLength: 8, example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
export class RegisterDto extends LoginDto {
  @ApiProperty({ example: 'Demo User' })
  @IsString()
  @MinLength(2)
  name!: string;
}

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'demo@example.com' })
  email!: string;

  @ApiProperty({ example: 'Demo User' })
  name!: string;
}

export class AuthResponseDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty({ type: AuthUserDto }) user!: AuthUserDto;
}

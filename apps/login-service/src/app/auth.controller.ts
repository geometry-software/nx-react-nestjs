import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  EmailVerificationResponseDto,
  LoginDto,
  PrepareSessionDto,
  PreparedSessionDto,
  RegisterDto,
  SocialIdentityDto,
  SocialLoginDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('session')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify a browser Firebase token and prepare its SQL session' })
  @ApiOkResponse({ type: PreparedSessionDto })
  public prepareSession(@Body() dto: PrepareSessionDto): Promise<PreparedSessionDto> {
    return this.auth.prepareSession(dto.idToken);
  }

  @Post('social')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange a social provider credential for a Firebase identity' })
  @ApiOkResponse({ type: SocialIdentityDto })
  public async socialLogin(@Body() dto: SocialLoginDto): Promise<SocialIdentityDto> {
    const identity = await this.auth.socialLogin(dto);
    return { provider: dto.provider, uid: identity.uid, idToken: identity.idToken };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register an account' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({ description: 'Email already registered' })
  public register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  public login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.auth.login(dto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Confirm an email address' })
  @ApiOkResponse({ description: 'Email address confirmed', type: EmailVerificationResponseDto })
  public verifyEmail(@Query('token') token: string): Promise<EmailVerificationResponseDto> {
    return this.auth.verifyEmail(token);
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmailAdapterModule, FireAuthAdapterModule, MongoAdapterModule, SqlAdapterModule } from 'geometry-sdk/adapters';
import { LoginFirebaseAuthAdapter } from './adapters/login-firebase-auth.adapter';
import { LoginEmailAdapter } from './adapters/login-email.adapter';
import { SessionSqlAdapter } from './adapters/session-sql.adapter';
import { UserMongoDBAdapter } from './adapters/user-mongodb.adapter';
import { sessionSupabaseSqlProviderConfiguration } from './providers/session-supabase-sql.provider';
import { loginEmailProviderConfiguration } from './providers/login-email.provider';
import { usersMongoProviderConfiguration } from './providers/users-mongo.provider';
import { loginFirebaseAuthProviderConfiguration } from './providers/login-firebase-auth.provider';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './services/email.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    SqlAdapterModule.forRootAsync(sessionSupabaseSqlProviderConfiguration),
    EmailAdapterModule.forRootAsync(loginEmailProviderConfiguration),
    MongoAdapterModule.forRootAsync(usersMongoProviderConfiguration),
    FireAuthAdapterModule.forRootAsync(loginFirebaseAuthProviderConfiguration),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, EmailService, LoginEmailAdapter, LoginFirebaseAuthAdapter, SessionSqlAdapter, UserMongoDBAdapter, UsersService],
})
export class AuthModule {}

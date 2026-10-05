import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createMongoTypeOrmOptions } from 'geometry-sdk/adapters';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Session } from './entities/session.entity';
import { User } from './entities/user.entity';
import { UserMongoRepository } from './repositories/user-mongo.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createMongoTypeOrmOptions(config, 'LOGIN_MONGODB_URI'),
    }),
    TypeOrmModule.forFeature([Session]),
    TypeOrmModule.forRootAsync({
      name: 'users',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createMongoTypeOrmOptions(config, 'USERS_MONGODB_URI'),
    }),
    TypeOrmModule.forFeature([User], 'users'),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UserMongoRepository, UsersService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createMongoTypeOrmOptions } from '@nx-react-nestjs/backend-utils';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createMongoTypeOrmOptions(config, 'AUTH_MONGODB_URI'),
    }),
    AuthModule,
  ],
})
export class AppModule {}

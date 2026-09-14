import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createMongoTypeOrmOptions } from '@nx-react-nestjs/backend-utils';
import { HealthController } from './health.controller';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createMongoTypeOrmOptions(config, 'USERS_MONGODB_URI'),
    }),
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

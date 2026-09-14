import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UserMongoRepository } from './repositories/user-mongo.repository';
import { UsersService } from './users.service';
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UserMongoRepository, UsersService],
})
export class UsersModule {}

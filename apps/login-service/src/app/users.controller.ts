import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BulkDeleteDto, BulkDeleteResultDto, CrudListQueryDto, DeleteResultDto } from 'geometry-sdk/adapters';
import { UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserPageResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users with filters and pagination' })
  @ApiOkResponse({ description: 'Paginated users', type: UserPageResponseDto })
  public findAll(@Query() query: CrudListQueryDto): Promise<UserPageResponseDto> {
    return this.usersService.findPage(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ type: User })
  public findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: User })
  public update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple users' })
  @ApiOkResponse({ description: 'Number of deleted users', type: BulkDeleteResultDto })
  public removeMany(@Body() dto: BulkDeleteDto): Promise<BulkDeleteResultDto> {
    return this.usersService.removeMany(dto.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse({ description: 'Deleted', type: DeleteResultDto })
  public remove(@Param('id') id: string): Promise<DeleteResultDto> {
    return this.usersService.remove(id);
  }
}

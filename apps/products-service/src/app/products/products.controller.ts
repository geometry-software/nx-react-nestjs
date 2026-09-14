import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  BulkDeleteDto,
  CrudListQueryDto,
} from '@nx-react-nestjs/backend-utils';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ResolveProductsDto } from './dto/resolve-products.dto';
import { DeductProductStockDto } from './dto/deduct-product-stock.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List products with URL-driven filters and pagination',
  })
  @ApiOkResponse({ description: 'Paginated products' })
  findAll(@Query() query: CrudListQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiOkResponse({ type: Product })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponse({ type: Product })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Post('resolve')
  @ApiOperation({ summary: 'Resolve products for another domain service' })
  @ApiOkResponse({ description: 'Resolved product snapshots', type: [Product] })
  async resolveMany(@Body() dto: ResolveProductsDto) {
    return { data: await this.productsService.resolveMany(dto.ids) };
  }

  @Post('stock/deduct')
  @ApiOperation({ summary: 'Deduct product quantities for a confirmed invoice' })
  @ApiOkResponse({ description: 'Products with updated quantities', type: [Product] })
  async deductStock(@Body() dto: DeductProductStockDto) {
    return { data: await this.productsService.deductStock(dto.items) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiOkResponse({ type: Product })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple products' })
  @ApiOkResponse({ description: 'Number of deleted products' })
  removeMany(@Body() dto: BulkDeleteDto) {
    return this.productsService.removeMany(dto.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiOkResponse({ description: 'Deleted' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { BulkDeleteDto, BulkDeleteResultDto, DeleteResultDto } from 'geometry-sdk/adapters';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ResolveProductsDto } from './dto/resolve-products.dto';
import { DeductProductStockDto } from './dto/deduct-product-stock.dto';
import { Product } from './entities/product.entity';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { ProductListResponseDto, ProductPageResponseDto } from './dto/product-response.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List products with URL-driven filters and pagination',
  })
  @ApiOkResponse({ description: 'Paginated products', type: ProductPageResponseDto })
  public findAll(@Query() query: ProductListQueryDto): Promise<ProductPageResponseDto> {
    return this.productsService.findPage(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiOkResponse({ type: Product })
  public findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponse({ type: Product })
  public create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Post('resolve')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resolve products for another domain service' })
  @ApiOkResponse({ description: 'Resolved product snapshots', type: ProductListResponseDto })
  public async resolveMany(@Body() dto: ResolveProductsDto): Promise<ProductListResponseDto> {
    return { data: await this.productsService.resolveMany(dto.ids) };
  }

  @Post('stock/deduct')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deduct product quantities for a confirmed invoice' })
  @ApiOkResponse({ description: 'Products with updated quantities', type: ProductListResponseDto })
  public async deductStock(@Body() dto: DeductProductStockDto): Promise<ProductListResponseDto> {
    return { data: await this.productsService.deductStock(dto.items) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiOkResponse({ type: Product })
  public update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple products' })
  @ApiOkResponse({ description: 'Number of deleted products', type: BulkDeleteResultDto })
  public removeMany(@Body() dto: BulkDeleteDto): Promise<BulkDeleteResultDto> {
    return this.productsService.removeMany(dto.ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiOkResponse({ description: 'Deleted', type: DeleteResultDto })
  public remove(@Param('id') id: string): Promise<DeleteResultDto> {
    return this.productsService.remove(id);
  }
}

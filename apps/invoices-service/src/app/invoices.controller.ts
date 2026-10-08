import { Body, Controller, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { InvoiceListQueryDto } from './dto/invoice-list-query.dto';
import { ResolveInvoicesDto } from './dto/resolve-invoices.dto';
import { InvoiceListResponseDto, InvoicePageResponseDto } from './dto/invoice-response.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices with URL-driven filters' })
  @ApiOkResponse({ description: 'Paginated invoices', type: InvoicePageResponseDto })
  public findAll(@Query() query: InvoiceListQueryDto): Promise<InvoicePageResponseDto> {
    return this.invoices.findPage(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by id' })
  @ApiOkResponse({ type: Invoice })
  public findOne(@Param('id') id: string): Promise<Invoice> {
    return this.invoices.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a pending invoice from product snapshots' })
  @ApiCreatedResponse({ type: Invoice })
  public create(@Body() dto: CreateInvoiceDto): Promise<Invoice> {
    return this.invoices.create(dto);
  }

  @Post('resolve')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resolve invoices for another domain service' })
  @ApiOkResponse({ description: 'Resolved invoice snapshots', type: InvoiceListResponseDto })
  public async resolveMany(@Body() dto: ResolveInvoicesDto): Promise<InvoiceListResponseDto> {
    return { data: await this.invoices.resolveMany(dto.ids) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit pending invoice details' })
  @ApiOkResponse({ type: Invoice })
  public update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto): Promise<Invoice> {
    return this.invoices.update(id, dto);
  }

  @Post(':id/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm invoice and deduct product quantities' })
  @ApiOkResponse({ type: Invoice })
  public confirm(@Param('id') id: string): Promise<Invoice> {
    return this.invoices.confirm(id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel a pending invoice' })
  @ApiOkResponse({ type: Invoice })
  public cancel(@Param('id') id: string): Promise<Invoice> {
    return this.invoices.cancel(id);
  }
}

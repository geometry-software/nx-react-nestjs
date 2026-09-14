import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { InvoiceListQueryDto } from './dto/invoice-list-query.dto';
import { ResolveInvoicesDto } from './dto/resolve-invoices.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices with URL-driven filters' })
  @ApiOkResponse({ description: 'Paginated invoices' })
  findAll(@Query() query: InvoiceListQueryDto) {
    return this.invoices.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by id' })
  @ApiOkResponse({ type: Invoice })
  findOne(@Param('id') id: string) {
    return this.invoices.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a pending invoice from product snapshots' })
  @ApiCreatedResponse({ type: Invoice })
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoices.create(dto);
  }

  @Post('resolve')
  @ApiOperation({ summary: 'Resolve invoices for another domain service' })
  @ApiOkResponse({ description: 'Resolved invoice snapshots', type: [Invoice] })
  async resolveMany(@Body() dto: ResolveInvoicesDto) {
    return { data: await this.invoices.resolveMany(dto.ids) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit pending invoice details' })
  @ApiOkResponse({ type: Invoice })
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoices.update(id, dto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm invoice and deduct product quantities' })
  @ApiOkResponse({ type: Invoice })
  confirm(@Param('id') id: string) {
    return this.invoices.confirm(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending invoice' })
  @ApiOkResponse({ type: Invoice })
  cancel(@Param('id') id: string) {
    return this.invoices.cancel(id);
  }
}

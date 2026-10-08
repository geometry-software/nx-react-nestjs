import {
  ConflictException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import type { InvoiceListQueryDto } from './dto/invoice-list-query.dto';
import { InvoiceStatus, Invoice } from './entities/invoice.entity';
import {
  ProductsAdapterPort,
  type InvoiceProduct,
} from './integrations/ports/products-port.adapter';
import { InvoiceMongoDBAdapter } from './adapters/invoice-mongodb.adapter';
import { buildInvoiceRecord, unavailableInvoiceProducts } from './utils/invoice-record';

@Injectable()
export class InvoicesService {
  constructor(
    @Inject(InvoiceMongoDBAdapter)
    private readonly adapter: InvoiceMongoDBAdapter,
    @Inject(ProductsAdapterPort)
    private readonly products: ProductsAdapterPort,
  ) {}

  public findPage(query: InvoiceListQueryDto) {
    const { status, ...pageQuery } = query;
    return this.adapter.findPage({
      ...pageQuery,
      ...(status ? { filter: { status } } : {}),
    });
  }

  public findOne(id: string) {
    return this.adapter.findOne(id);
  }

  public resolveMany(ids: string[]) {
    return this.adapter.resolveMany(ids);
  }

  public async create(dto: CreateInvoiceDto) {
    const products = await this.resolveProducts(dto.items);
    return this.adapter.create(Object.assign(new Invoice(), buildInvoiceRecord(dto, products)));
  }

  public async update(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.ensurePending(id);
    return this.adapter.update(invoice.id as string, {
      ...dto,
      ...(dto.name ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description.trim() }
        : {}),
    });
  }

  public async confirm(id: string): Promise<Invoice> {
    const invoice = await this.ensurePending(id);
    await this.products.deductStock(
      invoice.items.map(({ productId, quantity }) => ({ productId, quantity })),
    );
    return this.adapter.update(id, { status: InvoiceStatus.Complete });
  }

  public async cancel(id: string): Promise<Invoice> {
    await this.ensurePending(id);
    return this.adapter.update(id, { status: InvoiceStatus.Rejected });
  }

  private async ensurePending(id: string): Promise<Invoice> {
    const invoice = await this.adapter.findOne(id);
    if (invoice.status !== InvoiceStatus.Pending) {
      throw new ConflictException('Only pending invoices can be changed');
    }
    return invoice;
  }

  private async resolveProducts(
    selections: CreateInvoiceDto['items'],
  ): Promise<InvoiceProduct[]> {
    const ids = [...new Set(selections.map(({ productId }) => productId))];
    const products = await this.products.resolveProducts(ids);
    const invalid = unavailableInvoiceProducts(selections, products);
    if (invalid.length) {
      throw new UnprocessableEntityException({
        message: 'One or more invoice items are unavailable',
        products: invalid,
      });
    }
    return products;
  }
}

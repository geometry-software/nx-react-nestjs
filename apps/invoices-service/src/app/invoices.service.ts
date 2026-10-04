import {
  ConflictException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import type { InvoiceListQueryDto } from './dto/invoice-list-query.dto';
import type { Invoice, InvoiceItem } from './entities/invoice.entity';
import {
  ProductCatalogPort,
  type InvoiceProduct,
} from './integrations/ports/product-catalog.port';
import { InvoiceMongoRepository } from './repositories/invoice-mongo.repository';

type InvoiceMongoRepositoryPort = Pick<
  InvoiceMongoRepository,
  'findAll' | 'findOne' | 'create' | 'update' | 'resolveMany'
>;

@Injectable()
export class InvoicesService {
  constructor(
    @Inject(InvoiceMongoRepository)
    private readonly repository: InvoiceMongoRepositoryPort,
    @Inject(ProductCatalogPort)
    private readonly products: ProductCatalogPort,
  ) {}

  findAll(query: InvoiceListQueryDto) {
    return this.repository.findAll(query);
  }

  findOne(id: string) {
    return this.repository.findOne(id);
  }

  resolveMany(ids: string[]) {
    return this.repository.resolveMany(ids);
  }

  async create(dto: CreateInvoiceDto) {
    const products = await this.resolveProducts(dto.items);
    const productsById = new Map(
      products.map((product) => [String(product.id), product]),
    );
    const items = dto.items.map(({ productId, quantity }): InvoiceItem => {
      const product = productsById.get(productId)!;
      return {
        productId,
        name: product.name,
        description: product.description ?? '',
        unitPrice: product.price,
        quantity,
      };
    });
    return this.repository.create({
      name: dto.name.trim(),
      description: dto.description?.trim() ?? '',
      status: 'pending',
      items,
      total: items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      ),
    });
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.ensurePending(id);
    return this.repository.update(invoice.id as string, {
      ...dto,
      ...(dto.name ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description.trim() }
        : {}),
    });
  }

  async confirm(id: string): Promise<Invoice> {
    const invoice = await this.ensurePending(id);
    await this.products.deductStock(
      invoice.items.map(({ productId, quantity }) => ({ productId, quantity })),
    );
    return this.repository.update(id, { status: 'complete' });
  }

  async cancel(id: string): Promise<Invoice> {
    await this.ensurePending(id);
    return this.repository.update(id, { status: 'rejected' });
  }

  private async ensurePending(id: string): Promise<Invoice> {
    const invoice = await this.repository.findOne(id);
    if (invoice.status !== 'pending') {
      throw new ConflictException('Only pending invoices can be changed');
    }
    return invoice;
  }

  private async resolveProducts(
    selections: CreateInvoiceDto['items'],
  ): Promise<InvoiceProduct[]> {
    const ids = [...new Set(selections.map(({ productId }) => productId))];
    const products = await this.products.resolveProducts(ids);
    const byId = new Map(products.map((product) => [String(product.id), product]));
    const invalid = selections.flatMap(({ productId, quantity }) => {
      const product = byId.get(productId);
      const available = product?.quantity ?? 0;
      return !product || !product.active || available < quantity
        ? [{ productId, requested: quantity, available }]
        : [];
    });
    if (invalid.length) {
      throw new UnprocessableEntityException({
        message: 'One or more invoice items are unavailable',
        products: invalid,
      });
    }
    return products;
  }
}


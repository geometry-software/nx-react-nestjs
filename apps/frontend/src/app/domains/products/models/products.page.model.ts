import type { SubmitEvent } from 'react';
import type { Page } from '@/app/models/api.model';
import type { Language } from '@/app/locales/i18n';
import type { Translate } from '@/app/locales/locale';
import type { useProductsFeature } from '../feature/products.feature';
import type { Product } from './products.model';

type ProductsFeature = ReturnType<typeof useProductsFeature>;

export interface ProductsPageModel {
  readonly bulkDeleteError: string;
  readonly bulkDeleteOpen: boolean;
  readonly data?: Page<Product>;
  readonly deleteError: string;
  readonly deleteTarget: Product | null;
  readonly dialogOpen: boolean;
  readonly editTarget: Product | null;
  readonly error: string;
  readonly invalidFields: ReadonlySet<string>;
  readonly invoiceBusy: boolean;
  readonly invoiceDescription: string;
  readonly invoiceError: string;
  readonly invoiceName: string;
  readonly invoiceValidationShown: boolean;
  readonly isBulkDeleting: boolean;
  readonly isDeleting: boolean;
  readonly isFetching: boolean;
  readonly language: Language;
  readonly query: URLSearchParams;
  readonly reportOpen: boolean;
  readonly reportProducts: Product[];
  readonly reportQuantities: Record<string, string>;
  readonly reportTotal: number;
  readonly saveBusy: boolean;
  readonly search: string;
  readonly selectedCount: number;
  readonly selectedIds: ReadonlySet<string>;
  readonly translate: Translate;

  changeFilter(key: string, value: string): void;
  changeInvoiceDescription(value: string): void;
  changeInvoiceName(value: string): void;
  changeInvoiceQuantity(productId: string, quantity: string): void;
  changeOrder(order: 'asc' | 'desc'): void;
  changeSearch(value: string): void;
  changeSelection(ids: Set<string>): void;
  closeBulkDeleteDialog(): void;
  closeDeleteDialog(): void;
  closeInvoiceDialog(): void;
  closeProductDialog(): void;
  createInvoice(): Promise<void>;
  deleteProduct(): Promise<void>;
  deleteSelectedProducts(): Promise<void>;
  openBulkDeleteDialog(): void;
  openCreateDialog(): void;
  openDeleteDialog(product: Product): void;
  openEditDialog(product: Product): void;
  openInvoiceDialog(): void;
  submitProduct(event: SubmitEvent<HTMLFormElement>): Promise<void>;
}

export class ProductsPageModelInstance implements ProductsPageModel {
  public constructor(private readonly feature: ProductsFeature) {}

  public get bulkDeleteError() { return this.feature.bulkDeleteError; }
  public get bulkDeleteOpen() { return this.feature.bulkDeleteOpen; }
  public get data() { return this.feature.data; }
  public get deleteError() { return this.feature.deleteError; }
  public get deleteTarget() { return this.feature.deleteTarget; }
  public get dialogOpen() { return this.feature.dialogOpen; }
  public get editTarget() { return this.feature.editTarget; }
  public get error() { return this.feature.error; }
  public get invalidFields() { return this.feature.invalidFields; }
  public get invoiceBusy() {
    return this.feature.isCreatingInvoice || this.feature.isGeneratingReport;
  }
  public get invoiceDescription() { return this.feature.invoiceDescription; }
  public get invoiceError() { return this.feature.invoiceError; }
  public get invoiceName() { return this.feature.invoiceName; }
  public get invoiceValidationShown() {
    return this.feature.invoiceValidationShown;
  }
  public get isBulkDeleting() { return this.feature.isBulkDeleting; }
  public get isDeleting() { return this.feature.isDeleting; }
  public get isFetching() { return this.feature.isFetching; }
  public get language() { return this.feature.language; }
  public get query() { return this.feature.query; }
  public get reportOpen() { return this.feature.reportOpen; }
  public get reportProducts() { return this.feature.reportProducts; }
  public get reportQuantities() { return this.feature.reportQuantities; }
  public get reportTotal() { return this.feature.reportTotal; }
  public get saveBusy() {
    return this.feature.isCreating || this.feature.isUpdating;
  }
  public get search() { return this.feature.search; }
  public get selectedCount() { return this.feature.selectedIds.size; }
  public get selectedIds() { return this.feature.selectedIds; }
  public get translate() { return this.feature.translate; }

  public changeFilter = (key: string, value: string) =>
    this.feature.change(key, value);
  public changeInvoiceDescription = (value: string) =>
    this.feature.setInvoiceDescription(value);
  public changeInvoiceName = (value: string) =>
    this.feature.setInvoiceName(value);
  public changeInvoiceQuantity = (productId: string, quantity: string) =>
    this.feature.updateReportQuantity(productId, quantity);
  public changeOrder = (order: 'asc' | 'desc') =>
    this.feature.changeOrder(order);
  public changeSearch = (value: string) => this.feature.setSearch(value);
  public changeSelection = (ids: Set<string>) =>
    this.feature.setSelectedIds(ids);
  public closeBulkDeleteDialog = () => this.feature.closeBulkDeleteDialog();
  public closeDeleteDialog = () => this.feature.closeDeleteDialog();
  public closeInvoiceDialog = () => this.feature.closeReportDialog();
  public closeProductDialog = () => this.feature.closeDialog();
  public createInvoice = () => this.feature.createSelectedInvoice();
  public deleteProduct = () => this.feature.deleteProduct();
  public deleteSelectedProducts = () =>
    this.feature.deleteSelectedProducts();
  public openBulkDeleteDialog = () => this.feature.openBulkDeleteDialog();
  public openCreateDialog = () => this.feature.openCreateDialog();
  public openDeleteDialog = (product: Product) =>
    this.feature.openDeleteDialog(product);
  public openEditDialog = (product: Product) =>
    this.feature.openEditDialog(product);
  public openInvoiceDialog = () => this.feature.openProductReport();
  public submitProduct = (event: SubmitEvent<HTMLFormElement>) =>
    this.feature.submit(event);
}

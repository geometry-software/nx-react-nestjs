import type { SubmitEvent } from 'react';
import type { Page } from '@/app/models/api.model';
import type { Language } from '@/app/locales/i18n';
import type { Translate } from '@/app/locales/locale';
import type { useInvoicesFeature } from '../feature/invoices.feature';
import type { Invoice } from './invoices.model';

type InvoicesFeature = ReturnType<typeof useInvoicesFeature>;

export interface InvoicesPageModel {
  readonly actionError: string;
  readonly cancelOpen: boolean;
  readonly cancelTargetName: string;
  readonly confirmOpen: boolean;
  readonly confirmTargetName: string;
  readonly data?: Page<Invoice>;
  readonly editTarget: Invoice | null;
  readonly error: string;
  readonly isCancelling: boolean;
  readonly isConfirming: boolean;
  readonly isFetching: boolean;
  readonly isUpdating: boolean;
  readonly language: Language;
  readonly pageSize: number;
  readonly query: URLSearchParams;
  readonly search: string;
  readonly translate: Translate;

  cancelInvoice(): Promise<void>;
  changeFilter(key: string, value: string): void;
  changeOrder(order: 'asc' | 'desc'): void;
  changePage(page: number): void;
  changeSearch(value: string): void;
  closeCancelDialog(): void;
  closeConfirmDialog(): void;
  closeEditDialog(): void;
  confirmInvoice(): Promise<void>;
  openCancelDialog(invoice: Invoice): void;
  openConfirmDialog(invoice: Invoice): void;
  openEditDialog(invoice: Invoice): void;
  printInvoice(invoice: Invoice): Promise<void>;
  submitEdit(event: SubmitEvent<HTMLFormElement>): Promise<void>;
}

export class InvoicesPageModelInstance implements InvoicesPageModel {
  public constructor(private readonly feature: InvoicesFeature) {}

  public get actionError() { return this.feature.actionError; }
  public get cancelOpen() { return Boolean(this.feature.cancelTarget); }
  public get cancelTargetName() { return this.feature.cancelTarget?.name ?? ''; }
  public get confirmOpen() { return Boolean(this.feature.confirmTarget); }
  public get confirmTargetName() { return this.feature.confirmTarget?.name ?? ''; }
  public get data() { return this.feature.data; }
  public get editTarget() { return this.feature.editTarget; }
  public get error() { return this.feature.error; }
  public get isCancelling() { return this.feature.isCancelling; }
  public get isConfirming() { return this.feature.isConfirming; }
  public get isFetching() { return this.feature.isFetching; }
  public get isUpdating() { return this.feature.isUpdating; }
  public get language() { return this.feature.language; }
  public get pageSize() {
    return Number(this.feature.query.get('limit') ?? 10);
  }
  public get query() { return this.feature.query; }
  public get search() { return this.feature.search; }
  public get translate() { return this.feature.translate; }

  public cancelInvoice = () => this.feature.cancelPendingInvoice();
  public changeFilter = (key: string, value: string) =>
    this.feature.change(key, value);
  public changeOrder = (order: 'asc' | 'desc') =>
    this.feature.changeOrder(order);
  public changePage = (page: number) =>
    this.feature.change('page', String(page));
  public changeSearch = (value: string) => this.feature.setSearch(value);
  public closeCancelDialog = () => this.feature.closeCancelDialog();
  public closeConfirmDialog = () => this.feature.closeConfirmDialog();
  public closeEditDialog = () => this.feature.closeEditDialog();
  public confirmInvoice = () => this.feature.confirmPendingInvoice();
  public openCancelDialog = (invoice: Invoice) =>
    this.feature.openCancelDialog(invoice);
  public openConfirmDialog = (invoice: Invoice) =>
    this.feature.openConfirmDialog(invoice);
  public openEditDialog = (invoice: Invoice) =>
    this.feature.openEditDialog(invoice);
  public printInvoice = (invoice: Invoice) => this.feature.printInvoice(invoice);
  public submitEdit = (event: SubmitEvent<HTMLFormElement>) =>
    this.feature.save(event);
}

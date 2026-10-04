import type { SubmitEvent } from 'react';
import type { Page } from '@/app/models/api.model';
import type { Language } from '@/app/locales/i18n';
import type { Translate } from '@/app/locales/locale';
import type { Invoice } from '../../invoices/models/invoices.model';
import type { User } from '../../users/models/users.model';
import type { useShippingFeature } from '../feature/shipping.feature';
import type {
  CityLocation,
  CountryLocation,
  Shipment,
  ShipmentInput,
} from './shipping.model';

type ShippingFeature = ReturnType<typeof useShippingFeature>;

export interface ShippingPageModel {
  readonly bulkDeleteError: string;
  readonly bulkDeleteOpen: boolean;
  readonly cities?: CityLocation[];
  readonly citiesLoading: boolean;
  readonly countries?: CountryLocation[];
  readonly countriesLoading: boolean;
  readonly createOpen: boolean;
  readonly data?: Page<Shipment>;
  readonly deleteError: string;
  readonly deleteOpen: boolean;
  readonly deleteTargetName: string;
  readonly detailsDescription: string;
  readonly detailsTarget: Shipment | null;
  readonly error: string;
  readonly fieldErrors: Record<string, string>;
  readonly invalidFields: ReadonlySet<string>;
  readonly invoices?: Page<Invoice>;
  readonly invoicesLoading: boolean;
  readonly isBulkDeleting: boolean;
  readonly isCreating: boolean;
  readonly isDeleting: boolean;
  readonly isFetching: boolean;
  readonly isRefreshing: boolean;
  readonly language: Language;
  readonly pageSize: number;
  readonly query: URLSearchParams;
  readonly recipient: ShipmentInput['recipient'];
  readonly search: string;
  readonly selectedCount: number;
  readonly selectedCountryCode: string;
  readonly selectedInvoiceIds: ReadonlySet<string>;
  readonly selectedIds: ReadonlySet<string>;
  readonly selectedUserId: string;
  readonly translate: Translate;
  readonly users?: Page<User>;
  readonly usersLoading: boolean;

  changeFilter(key: string, value: string): void;
  changePage(page: number): void;
  changeSearch(value: string): void;
  changeSelection(ids: Set<string>): void;
  closeBulkDeleteDialog(): void;
  closeCreateDialog(): void;
  closeDeleteDialog(): void;
  closeDetailsDialog(): void;
  deleteSelectedShipments(): Promise<void>;
  deleteShipment(): Promise<void>;
  openBulkDeleteDialog(): void;
  openCreateDialog(): void;
  openDeleteDialog(shipment: Shipment): void;
  openDetailsDialog(shipment: Shipment): void;
  searchCity(value: string): void;
  searchCountry(value: string): void;
  selectCity(value: string): void;
  selectCountry(value: string, label: string): void;
  selectUser(userId: string): void;
  submit(event: SubmitEvent<HTMLFormElement>): Promise<void>;
  syncTracking(): Promise<void>;
  toggleInvoice(invoiceId: string, selected: boolean): void;
  updateRecipient(field: keyof ShipmentInput['recipient'], value: string): void;
}

export class ShippingPageModelInstance implements ShippingPageModel {
  public constructor(private readonly feature: ShippingFeature) {}

  public get bulkDeleteError() { return this.feature.bulkDeleteError; }
  public get bulkDeleteOpen() { return this.feature.bulkDeleteOpen; }
  public get cities() { return this.feature.cities; }
  public get citiesLoading() { return this.feature.citiesLoading; }
  public get countries() { return this.feature.countries; }
  public get countriesLoading() { return this.feature.countriesLoading; }
  public get createOpen() { return this.feature.createOpen; }
  public get data() { return this.feature.data; }
  public get deleteError() { return this.feature.deleteError; }
  public get deleteOpen() { return Boolean(this.feature.deleteTarget); }
  public get deleteTargetName() {
    return this.feature.deleteTarget?.trackingNumber ?? '';
  }
  public get detailsDescription() { return this.feature.detailsDescription; }
  public get detailsTarget() { return this.feature.detailsTarget; }
  public get error() { return this.feature.error; }
  public get fieldErrors() { return this.feature.fieldErrors; }
  public get invalidFields() { return this.feature.invalidFields; }
  public get invoices() { return this.feature.invoices; }
  public get invoicesLoading() { return this.feature.invoicesLoading; }
  public get isBulkDeleting() { return this.feature.isBulkDeleting; }
  public get isCreating() { return this.feature.isCreating; }
  public get isDeleting() { return this.feature.isDeleting; }
  public get isFetching() { return this.feature.isFetching; }
  public get isRefreshing() { return this.feature.isRefreshing; }
  public get language() { return this.feature.language; }
  public get pageSize() {
    return Number(this.feature.query.get('limit') ?? 10);
  }
  public get query() { return this.feature.query; }
  public get recipient() { return this.feature.recipient; }
  public get search() { return this.feature.search; }
  public get selectedCount() { return this.feature.selectedIds.size; }
  public get selectedCountryCode() { return this.feature.selectedCountryCode; }
  public get selectedInvoiceIds() { return this.feature.selectedInvoices; }
  public get selectedIds() { return this.feature.selectedIds; }
  public get selectedUserId() { return this.feature.selectedUserId; }
  public get translate() { return this.feature.translate; }
  public get users() { return this.feature.users; }
  public get usersLoading() { return this.feature.usersLoading; }

  public changeFilter = (key: string, value: string) =>
    this.feature.change(key, value);
  public changePage = (page: number) =>
    this.feature.change('page', String(page));
  public changeSearch = (value: string) => this.feature.setSearch(value);
  public changeSelection = (ids: Set<string>) =>
    this.feature.setSelectedIds(ids);
  public closeBulkDeleteDialog = () =>
    this.feature.closeBulkDeleteDialog();
  public closeCreateDialog = () => this.feature.closeCreate();
  public closeDeleteDialog = () => this.feature.closeDeleteDialog();
  public closeDetailsDialog = () => this.feature.closeDetailsDialog();
  public deleteSelectedShipments = () =>
    this.feature.deleteSelectedShipments();
  public deleteShipment = () => this.feature.deleteShipment();
  public openBulkDeleteDialog = () => this.feature.openBulkDeleteDialog();
  public openCreateDialog = () => this.feature.openCreate();
  public openDeleteDialog = (shipment: Shipment) =>
    this.feature.openDeleteDialog(shipment);
  public openDetailsDialog = (shipment: Shipment) =>
    this.feature.openDetailsDialog(shipment);
  public searchCity = (value: string) => this.feature.searchCity(value);
  public searchCountry = (value: string) => this.feature.searchCountry(value);
  public selectCity = (value: string) => this.feature.selectCity(value);
  public selectCountry = (value: string, label: string) =>
    this.feature.selectCountry(value, label);
  public selectUser = (userId: string) => this.feature.selectUser(userId);
  public submit = (event: SubmitEvent<HTMLFormElement>) =>
    this.feature.submit(event);
  public syncTracking = () => this.feature.syncTracking();
  public toggleInvoice = (invoiceId: string, selected: boolean) =>
    this.feature.toggleInvoice(invoiceId, selected);
  public updateRecipient = (
    field: keyof ShipmentInput['recipient'],
    value: string,
  ) => this.feature.updateRecipient(field, value);
}

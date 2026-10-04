import type { SubmitEvent } from 'react';
import type { Page } from '@/app/models/api.model';
import type { Language } from '@/app/locales/i18n';
import type { Translate } from '@/app/locales/locale';
import type { useUsersFeature } from '../feature/users.feature';
import type { User } from './users.model';

type UsersFeature = ReturnType<typeof useUsersFeature>;

export interface UsersPageModel {
  readonly bulkDeleteError: string;
  readonly bulkDeleteOpen: boolean;
  readonly data?: Page<User>;
  readonly deleteError: string;
  readonly deleteOpen: boolean;
  readonly deleteTargetName: string;
  readonly dialogOpen: boolean;
  readonly editTarget: User | null;
  readonly error: string;
  readonly invalidFields: ReadonlySet<string>;
  readonly isBulkDeleting: boolean;
  readonly isDeleting: boolean;
  readonly isFetching: boolean;
  readonly isUpdating: boolean;
  readonly language: Language;
  readonly pageSize: number;
  readonly query: URLSearchParams;
  readonly role: string;
  readonly search: string;
  readonly selectedCount: number;
  readonly selectedIds: ReadonlySet<string>;
  readonly translate: Translate;

  changeFilter(key: string, value: string): void;
  changeOrder(order: 'asc' | 'desc'): void;
  changePage(page: number): void;
  changeRole(role: string): void;
  changeSearch(value: string): void;
  changeSelection(ids: Set<string>): void;
  closeBulkDeleteDialog(): void;
  closeDeleteDialog(): void;
  closeEditDialog(): void;
  deleteSelectedUsers(): Promise<void>;
  deleteUser(): Promise<void>;
  openBulkDeleteDialog(): void;
  openDeleteDialog(user: User): void;
  openEditDialog(user: User): void;
  submit(event: SubmitEvent<HTMLFormElement>): Promise<void>;
}

export class UsersPageModelInstance implements UsersPageModel {
  public constructor(private readonly feature: UsersFeature) {}

  public get bulkDeleteError() { return this.feature.bulkDeleteError; }
  public get bulkDeleteOpen() { return this.feature.bulkDeleteOpen; }
  public get data() { return this.feature.data; }
  public get deleteError() { return this.feature.deleteError; }
  public get deleteOpen() { return Boolean(this.feature.deleteTarget); }
  public get deleteTargetName() { return this.feature.deleteTarget?.name ?? ''; }
  public get dialogOpen() { return this.feature.dialogOpen; }
  public get editTarget() { return this.feature.editTarget; }
  public get error() { return this.feature.error; }
  public get invalidFields() { return this.feature.invalidFields; }
  public get isBulkDeleting() { return this.feature.isBulkDeleting; }
  public get isDeleting() { return this.feature.isDeleting; }
  public get isFetching() { return this.feature.isFetching; }
  public get isUpdating() { return this.feature.isUpdating; }
  public get language() { return this.feature.language; }
  public get pageSize() {
    return Number(this.feature.query.get('limit') ?? 10);
  }
  public get query() { return this.feature.query; }
  public get role() { return this.feature.role; }
  public get search() { return this.feature.search; }
  public get selectedCount() { return this.feature.selectedIds.size; }
  public get selectedIds() { return this.feature.selectedIds; }
  public get translate() { return this.feature.translate; }

  public changeFilter = (key: string, value: string) =>
    this.feature.change(key, value);
  public changeOrder = (order: 'asc' | 'desc') =>
    this.feature.changeOrder(order);
  public changePage = (page: number) =>
    this.feature.change('page', String(page));
  public changeRole = (role: string) => this.feature.setRole(role);
  public changeSearch = (value: string) => this.feature.setSearch(value);
  public changeSelection = (ids: Set<string>) =>
    this.feature.setSelectedIds(ids);
  public closeBulkDeleteDialog = () => this.feature.closeBulkDeleteDialog();
  public closeDeleteDialog = () => this.feature.closeDeleteDialog();
  public closeEditDialog = () => this.feature.closeDialog();
  public deleteSelectedUsers = () => this.feature.deleteSelectedUsers();
  public deleteUser = () => this.feature.deleteUser();
  public openBulkDeleteDialog = () => this.feature.openBulkDeleteDialog();
  public openDeleteDialog = (user: User) => this.feature.openDeleteDialog(user);
  public openEditDialog = (user: User) => this.feature.openEditDialog(user);
  public submit = (event: SubmitEvent<HTMLFormElement>) =>
    this.feature.submit(event);
}

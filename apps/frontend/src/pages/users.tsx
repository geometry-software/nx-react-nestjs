import {
  CheckCircle2,
  Pencil,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonLoader } from '@nx-react-nestjs/components/app/button-loader';
import { ConfirmDialog } from '@nx-react-nestjs/components/app/confirm-dialog';
import { DataTable } from '@nx-react-nestjs/components/app/data-table';
import { EntityDialog } from '@nx-react-nestjs/components/app/entity-dialog';
import { FilterSelect } from '@nx-react-nestjs/components/app/filter-select';
import { OperationNotice } from '@nx-react-nestjs/components/app/operation-notice';
import { Alert, AlertDescription } from '@nx-react-nestjs/components/ui/alert';
import { Avatar, AvatarFallback } from '@nx-react-nestjs/components/ui/avatar';
import { Badge } from '@nx-react-nestjs/components/ui/badge';
import { Button } from '@nx-react-nestjs/components/ui/button';
import {
  Card,
  CardContent,
} from '@nx-react-nestjs/components/ui/card';
import { Input } from '@nx-react-nestjs/components/ui/input';
import { Label } from '@nx-react-nestjs/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nx-react-nestjs/components/ui/tooltip';
import { formatDateTime } from '@/lib/format-date';
import { confirmDialogLabels, tableLabels, useI18n } from '../app/i18n';
import { userSchema } from '@/lib/schemas';
import type { User } from '@/lib/types';
import { useDebouncedSearchParam } from '@/lib/use-debounced-search-param';
import {
  usersUrl,
  useCreateUserMutation,
  useDeleteUserMutation,
  useDeleteUsersMutation,
  useListUsersQuery,
  useUpdateUserMutation,
} from '@/services/api';

export function Users() {
  const { language, t } = useI18n();
  const [params, setParams] = useSearchParams();
  const query = new URLSearchParams(params);
  for (const [key, value] of Object.entries({
    page: '1',
    limit: '10',
    sort: 'createdAt',
    order: 'desc',
  }))
    if (!query.has(key)) query.set(key, value);
  const requestUrl = `${usersUrl}/api/users?${query}`;
  const { data, isFetching, isError, refetch } = useListUsersQuery(
    requestUrl,
    { refetchOnMountOrArgChange: true },
  );
  const [create, { isLoading: isCreating }] = useCreateUserMutation();
  const [update, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [remove, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [removeMany, { isLoading: isBulkDeleting }] =
    useDeleteUsersMutation();
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState('');
  const [role, setRole] = useState('viewer');
  const [search, setSearch] = useDebouncedSearchParam(params, setParams);
  useEffect(() => setSelectedIds(new Set()), [requestUrl]);
  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setError('');
    setInvalidFields(new Set());
  };
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const parsed = userSchema.safeParse({
      name: form.get('name'),
      email: form.get('email'),
      role,
      active: true,
    });
    if (!parsed.success) {
      setError(t('common.validation'));
      setInvalidFields(
        new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
      );
      return;
    }
    setInvalidFields(new Set());
    try {
      if (editTarget)
        await update({ id: editTarget.id, body: parsed.data, cacheKey: requestUrl }).unwrap();
      else await create({ body: parsed.data, cacheKey: requestUrl }).unwrap();
    } catch {
      setError(t('users.rejected'));
      return;
    }
    formElement.reset();
    setNotice(t(editTarget ? 'users.saved' : 'users.created'));
    closeDialog();
  }
  async function deleteUser() {
    if (!deleteTarget) return;
    try {
      await remove({ id: deleteTarget.id, cacheKey: requestUrl }).unwrap();
      setNotice(t('users.removed', { name: deleteTarget.name }));
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
      setDeleteError('');
    } catch {
      setDeleteError(t('users.rejected'));
    }
  }

  async function deleteSelectedUsers() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    try {
      const result = await removeMany({ ids, cacheKey: requestUrl }).unwrap();
      setNotice(t('common.deletedSelected', { count: result.deleted }));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      setBulkDeleteError('');
    } catch {
      setBulkDeleteError(t('users.rejected'));
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {t('users.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">{t('users.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={selectedIds.size === 0}
            onClick={() => {
              setBulkDeleteError('');
              setBulkDeleteOpen(true);
            }}
            size="lg"
            variant="destructive"
          >
            <Trash2 />
            {t('common.deleteSelected', { count: selectedIds.size })}
          </Button>
          <Button
            onClick={() => {
              setEditTarget(null);
              setRole('viewer');
              setDialogOpen(true);
            }}
            size="lg"
          >
            <UserPlus />
            {t('users.add')}
          </Button>
        </div>
      </header>
      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {t('users.loadError')}
            <Button onClick={() => refetch()} size="sm" variant="outline">
              {t('users.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-2">
            <Label htmlFor="user-search">{t('users.searchLabel')}</Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground"
              />
              <Input
                className="w-full pl-9 lg:w-80"
                id="user-search"
                placeholder={t('users.searchPlaceholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Field label={t('common.sort')}>
              <FilterSelect
                ariaLabel={t('users.sortLabel')}
                value={query.get('sort') ?? 'createdAt'}
                onChange={(value) => change('sort', value)}
                options={[
                  { value: 'createdAt', label: t('users.createdDate') },
                  { value: 'updatedAt', label: t('users.updatedDate') },
                  { value: 'name', label: t('users.byName') },
                  { value: 'email', label: t('users.byEmail') },
                  { value: 'role', label: t('users.byRole') },
                ]}
              />
            </Field>
            <div className="flex gap-1 rounded-lg border p-1">
              <Button
                onClick={() =>
                  query.get('order') === 'desc'
                    ? refetch()
                    : change('order', 'desc')
                }
                size="sm"
                variant={query.get('order') === 'desc' ? 'default' : 'ghost'}
              >
                {t('common.desc')}
              </Button>
              <Button
                onClick={() =>
                  query.get('order') === 'asc'
                    ? refetch()
                    : change('order', 'asc')
                }
                size="sm"
                variant={query.get('order') === 'asc' ? 'default' : 'ghost'}
              >
                {t('common.asc')}
              </Button>
            </div>
            <Field label={t('common.show')}>
              <FilterSelect
                ariaLabel={t('users.pageSize')}
                value={query.get('limit') ?? '10'}
                onChange={(value) => change('limit', value)}
                options={['5', '10', '20'].map((value) => ({
                  value,
                  label: t('users.rows', { count: Number(value) }),
                }))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>
      <DataTable<User>
        labels={tableLabels(t)}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        rows={data?.data ?? []}
        loading={isFetching}
        total={data?.meta.total ?? 0}
        page={data?.meta.page ?? 1}
        pageSize={data?.meta.limit ?? Number(query.get('limit') ?? 10)}
        pages={data?.meta.totalPages ?? 1}
        itemLabel={t('users.items')}
        onPage={(page) => change('page', String(page))}
        columns={[
          {
            label: t('users.name'),
            render: (user) => (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="grid">
                  <strong>{user.name}</strong>
                  <small className="text-muted-foreground">
                    UID: USR-{user.id.slice(-4).toUpperCase()}
                  </small>
                </span>
              </div>
            ),
          },
          {
            label: t('users.email'),
            render: (user) => <code className="text-sm">{user.email}</code>,
          },
          {
            label: t('users.role'),
            render: (user) => (
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {t(`users.${user.role}`)}
              </Badge>
            ),
          },
          {
            label: t('users.createdDate'),
            className: 'w-44 whitespace-nowrap',
            render: (user) => formatDateTime(user.createdAt, language),
          },
          {
            label: t('users.updatedDate'),
            className: 'w-44 whitespace-nowrap',
            render: (user) => formatDateTime(user.updatedAt, language),
          },
          {
            label: t('users.actions'),
            className: 'w-24',
            render: (user) => (
              <div className="flex justify-end gap-1">
                <ActionButton
                  label={t('common.edit', { name: user.name })}
                  onClick={() => {
                    setEditTarget(user);
                    setRole(user.role);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil />
                </ActionButton>
                <ActionButton
                  destructive
                  label={t('common.delete', { name: user.name })}
                  onClick={() => {
                    setDeleteError('');
                    setDeleteTarget(user);
                  }}
                >
                  <Trash2 />
                </ActionButton>
              </div>
            ),
          },
        ]}
      />
      <EntityDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={t(editTarget ? 'users.editTitle' : 'users.modalTitle')}
      >
        <form
          className="grid gap-4"
          key={editTarget?.id ?? 'create-user'}
          onSubmit={submit}
        >
          <Field label={t('users.fullName')}>
            <Input
              aria-invalid={invalidFields.has('name')}
              defaultValue={editTarget?.name}
              name="name"
              placeholder={t('users.namePlaceholder')}
            />
          </Field>
          <Field label={t('users.workEmail')}>
            <Input
              aria-invalid={invalidFields.has('email')}
              defaultValue={editTarget?.email}
              name="email"
              placeholder="e.g., marcus@nxmonorepo.com"
              type="email"
            />
          </Field>
          <Field label={t('users.roleTier')}>
            <FilterSelect
              ariaLabel={t('users.roleTier')}
              className="w-full"
              invalid={invalidFields.has('role')}
              value={role}
              onChange={setRole}
              options={(['viewer', 'manager', 'admin'] as const).map(
                (value) => ({
                  value,
                  label: t(`users.${value}`),
                }),
              )}
            />
          </Field>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button disabled={isCreating || isUpdating} size="lg" type="submit">
            {isCreating || isUpdating ? (
              <ButtonLoader />
            ) : editTarget ? (
              <CheckCircle2 />
            ) : (
              <UserPlus />
            )}
            {isCreating || isUpdating
              ? t(editTarget ? 'common.saving' : 'users.adding')
              : t(editTarget ? 'common.saveChanges' : 'users.add')}
          </Button>
        </form>
      </EntityDialog>
      <ConfirmDialog
        labels={confirmDialogLabels(t)}
        busy={isDeleting}
        error={deleteError}
        itemName={deleteTarget?.name ?? ''}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError('');
        }}
        onConfirm={deleteUser}
        open={Boolean(deleteTarget)}
      />
      <ConfirmDialog
        labels={confirmDialogLabels(t)}
        busy={isBulkDeleting}
        error={bulkDeleteError}
        itemName={t('common.selectedItems', { count: selectedIds.size })}
        onClose={() => {
          setBulkDeleteOpen(false);
          setBulkDeleteError('');
        }}
        onConfirm={deleteSelectedUsers}
        open={bulkDeleteOpen}
      />
      {notice && (
        <OperationNotice
          closeLabel={t('common.close')}
          message={notice}
          onClose={() => setNotice('')}
        />
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function ActionButton({
  label,
  destructive,
  onClick,
  children,
}: {
  label: string;
  destructive?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className={
            destructive ? 'border-0 focus-visible:border-0' : undefined
          }
          onClick={onClick}
          size="icon"
          variant={destructive ? 'destructive' : 'ghost'}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

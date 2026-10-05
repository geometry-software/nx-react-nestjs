import { Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DataTable,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'geometry-sdk/components';
import { tableLabels } from '@/app/utils/i18n-labels';
import { formatDateTime } from '@/app/utils/format-value';
import type { User } from '../models/users.model';
import type { Page } from '@/app/models/api.model';
import type { Language } from '@/app/utils/i18n';
import type { Translate } from '@/app/locales/locale';

export function UsersTable({
  data,
  language,
  loading,
  onDelete,
  onEdit,
  onPageChange,
  onSelectedIdsChange,
  pageSize,
  selectedIds,
  translate,
}: {
  data?: Page<User>;
  language: Language;
  loading: boolean;
  onDelete: (user: User) => void;
  onEdit: (user: User) => void;
  onPageChange: (page: number) => void;
  onSelectedIdsChange: (ids: Set<string>) => void;
  pageSize: number;
  selectedIds: ReadonlySet<string>;
  translate: Translate;
}) {
  const columns = [
    {
      label: translate('users.name'),
      sortValue: (user: User) => user.name,
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
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
      label: translate('users.email'),
      sortValue: (user: User) => user.email,
      render: (user: User) => <code className="text-sm">{user.email}</code>,
    },
    {
      label: translate('users.role'),
      sortValue: (user: User) => user.role,
      render: (user: User) => (
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
          {translate(`users.${user.role}`)}
        </Badge>
      ),
    },
    {
      label: translate('users.createdDate'),
      className: 'w-44 whitespace-nowrap',
      sortValue: (user: User) => user.createdAt,
      render: (user: User) => formatDateTime(user.createdAt, language),
    },
    {
      label: translate('users.updatedDate'),
      className: 'w-44 whitespace-nowrap',
      sortValue: (user: User) => user.updatedAt,
      render: (user: User) => formatDateTime(user.updatedAt, language),
    },
    {
      label: translate('users.actions'),
      className: 'w-24',
      render: (user: User) => (
        <div className="flex justify-end gap-1">
          <UserAction
            label={translate('common.edit', { name: user.name })}
            onClick={() => onEdit(user)}
          >
            <Pencil />
          </UserAction>
          <UserAction
            destructive
            label={translate('common.delete', { name: user.name })}
            onClick={() => onDelete(user)}
          >
            <Trash2 />
          </UserAction>
        </div>
      ),
    },
  ];

  return (
    <DataTable<User>
      columns={columns}
      itemLabel={translate('users.items')}
      labels={tableLabels(translate)}
      loading={loading}
      onPage={onPageChange}
      onSelectedIdsChange={onSelectedIdsChange}
      page={data?.meta.page ?? 1}
      pages={data?.meta.totalPages ?? 1}
      pageSize={data?.meta.limit ?? pageSize}
      rows={data?.data ?? []}
      selectedIds={selectedIds}
      total={data?.meta.total ?? 0}
    />
  );
}

function UserAction({
  label,
  destructive = false,
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
          className={destructive ? 'border-0 focus-visible:border-0' : undefined}
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

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
}

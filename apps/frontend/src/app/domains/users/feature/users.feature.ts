import {
  useDebouncedSearchParam,
  useListQueryParams,
  useNotification,
  useQueryErrorNotification,
  useRowSelection,
} from 'geometry-sdk/components';
import { useState } from 'react';
import { useI18n } from '@/app/utils/i18n';
import { createUserValidation } from '../validation/users.validation';
import type { User } from '../models/users.model';
import { useUsersService } from '../service/users.service';
import { executeRequest } from '@/app/utils/execute-request';

export function useUsersFeature() {
  const { language, translate } = useI18n();
  const { notifyError, notifySuccess } = useNotification();
  const { params, setParams, query, isReady, change, changeOrder } =
    useListQueryParams();
  const requestQuery = query.toString();
  const {
    listQuery: { data, isFetching, isError, refetch },
    update,
    remove,
    removeMany,
    isUpdating,
    isDeleting,
    isBulkDeleting,
  } = useUsersService(requestQuery, isReady);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const {
    selectedIds,
    setSelectedIds,
    clearSelection,
    removeSelectedId,
  } = useRowSelection(requestQuery);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState('');
  const [role, setRole] = useState('viewer');
  const [search, setSearch] = useDebouncedSearchParam(params, setParams);

  useQueryErrorNotification({
    isError,
    message: translate('users.loadError'),
    retryLabel: translate('common.retry'),
    retry: refetch,
  });

  const openEditDialog = (user: User) => {
    setEditTarget(user);
    setRole(user.role);
    setDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setDeleteError('');
    setDeleteTarget(user);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    setDeleteError('');
  };

  const openBulkDeleteDialog = () => {
    setBulkDeleteError('');
    setBulkDeleteOpen(true);
  };

  const closeBulkDeleteDialog = () => {
    setBulkDeleteOpen(false);
    setBulkDeleteError('');
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setError('');
    setInvalidFields(new Set());
    setFieldErrors({});
  };

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editTarget) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const parsed = createUserValidation(translate).safeParse({
      name: form.get('name'),
      email: form.get('email'),
      role,
      active: true,
    });
    if (!parsed.success) {
      setError('');
      notifyError(translate('common.validation'));
      setFieldErrors(Object.fromEntries(parsed.error.issues.map(({ path, message }) => [path.join('.'), message])));
      setInvalidFields(
        new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
      );
      return;
    }
    setInvalidFields(new Set());
    setFieldErrors({});
    const saved = await executeRequest(() =>
      update({
          id: editTarget.id,
          body: parsed.data,
          cacheKey: requestQuery,
        }),
    );
    if (!saved.ok) {
      setError(translate('users.rejected'));
      return;
    }
    formElement.reset();
    notifySuccess(translate('users.saved'));
    closeDialog();
  }

  async function deleteUser() {
    if (!deleteTarget) return;
    const result = await executeRequest(
      () => remove({ id: deleteTarget.id, cacheKey: requestQuery }),
    );
    if (!result.ok) {
      setDeleteError(translate('users.rejected'));
      return;
    }
    notifySuccess(translate('users.removed', { name: deleteTarget.name }));
    removeSelectedId(deleteTarget.id);
    setDeleteTarget(null);
    setDeleteError('');
  }

  async function deleteSelectedUsers() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const result = await executeRequest(
      () => removeMany({ ids, cacheKey: requestQuery }),
    );
    if (!result.ok) {
      setBulkDeleteError(translate('users.rejected'));
      return;
    }
    notifySuccess(
      translate('common.deletedSelected', { count: result.data.deleted }),
    );
    clearSelection();
    setBulkDeleteOpen(false);
    setBulkDeleteError('');
  }

  return {
    language,
    translate,
    query,
    data,
    isFetching,
    isError,
    refetch,
    isUpdating,
    isDeleting,
    isBulkDeleting,
    error,
    invalidFields,
    fieldErrors,
    dialogOpen,
    setDialogOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    deleteError,
    setDeleteError,
    selectedIds,
    setSelectedIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    bulkDeleteError,
    setBulkDeleteError,
    role,
    setRole,
    search,
    setSearch,
    change,
    changeOrder,
    openEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,
    closeDialog,
    submit,
    deleteUser,
    deleteSelectedUsers,
    selectedCount: selectedIds.size,
    pageSize: Number(query.get('limit') ?? 10),
    deleteOpen: deleteTarget !== null,
    deleteTargetName: deleteTarget?.name ?? '',
    changeSelection: setSelectedIds,
    changePage: (page: number) => change('page', String(page)),
    closeEditDialog: closeDialog,
    changeRole: setRole,
    changeFilter: change,
    changeSearch: setSearch,
  };
}

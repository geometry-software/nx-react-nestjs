import type { SubmitEvent } from 'react';
import {
  Alert,
  AlertDescription,
  Button,
  EntityDialog,
  FilterSelect,
  FormField,
  FormInput,
} from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';
import type { User } from '../models/users.model';

export function UserFormDialog({
  editTarget,
  error,
  invalidFields,
  fieldErrors,
  isUpdating,
  onClose,
  onRoleChange,
  onSubmit,
  open,
  role,
  translate,
}: {
  editTarget: User | null;
  error: string;
  invalidFields: ReadonlySet<string>;
  fieldErrors: Record<string, string>;
  isUpdating: boolean;
  onClose: () => void;
  onRoleChange: (role: string) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  open: boolean;
  role: string;
  translate: Translate;
}) {
  const roleOptions = (['viewer', 'manager', 'admin'] as const).map(
    (value) => ({ value, label: translate(`users.${value}`) }),
  );

  return (
    <EntityDialog
      onClose={onClose}
      open={open}
      title={translate('users.editTitle')}
    >
      <form
        noValidate
        className="grid gap-4"
        key={editTarget?.id ?? 'edit-user'}
        onSubmit={onSubmit}
      >
        <FormInput
          defaultValue={editTarget?.name}
          error={fieldErrors.name}
          invalid={invalidFields.has('name')}
          label={translate('users.fullName')}
          name="name"
          placeholder={translate('users.namePlaceholder')}
          required
          requiredLabel={translate('common.required')}
        />
        <FormInput
          defaultValue={editTarget?.email}
          error={fieldErrors.email}
          invalid={invalidFields.has('email')}
          label={translate('users.workEmail')}
          name="email"
          placeholder={translate('users.emailPlaceholder')}
          required
          requiredLabel={translate('common.required')}
          type="email"
        />
        <FormField
          error={fieldErrors.role}
          invalid={invalidFields.has('role')}
          label={translate('users.roleTier')}
          required
          requiredLabel={translate('common.required')}
        >
          <FilterSelect
            ariaLabel={translate('users.roleTier')}
            className="w-full"
            invalid={invalidFields.has('role')}
            onChange={onRoleChange}
            options={roleOptions}
            value={role}
          />
        </FormField>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          className="justify-self-end px-6"
          loading={isUpdating}
          loadingLabel={translate('common.saving')}
          size="lg"
          type="submit"
        >
          {translate('common.saveChanges')}
        </Button>
      </form>
    </EntityDialog>
  );
}

import { CheckCircle2 } from 'lucide-react';
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
        className="grid gap-4"
        key={editTarget?.id ?? 'edit-user'}
        onSubmit={onSubmit}
      >
        <FormInput
          defaultValue={editTarget?.name}
          invalid={invalidFields.has('name')}
          label={translate('users.fullName')}
          name="name"
          placeholder={translate('users.namePlaceholder')}
        />
        <FormInput
          defaultValue={editTarget?.email}
          invalid={invalidFields.has('email')}
          label={translate('users.workEmail')}
          name="email"
          placeholder={translate('users.emailPlaceholder')}
          type="email"
        />
        <FormField
          invalid={invalidFields.has('role')}
          label={translate('users.roleTier')}
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
          loading={isUpdating}
          loadingLabel={translate('common.saving')}
          size="lg"
          type="submit"
        >
          <CheckCircle2 />
          {translate('common.saveChanges')}
        </Button>
      </form>
    </EntityDialog>
  );
}

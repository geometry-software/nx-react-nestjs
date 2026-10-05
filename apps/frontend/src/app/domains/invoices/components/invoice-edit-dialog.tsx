import type { SubmitEvent } from 'react';
import {
  Alert,
  AlertDescription,
  Button,
  EntityDialog,
  FormField,
  FormInput,
  Textarea,
} from 'geometry-sdk/components';
import type { Invoice } from '../models/invoices.model';
import type { Translate } from '@/app/locales/locale';

export function InvoiceEditDialog({
  editTarget,
  error,
  fieldErrors,
  isUpdating,
  onClose,
  onSubmit,
  translate,
}: {
  editTarget: Invoice | null;
  error: string;
  fieldErrors: Record<string, string>;
  isUpdating: boolean;
  onClose: () => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  translate: Translate;
}) {
  return (
    <EntityDialog
      description={translate('invoices.editDescription')}
      onClose={onClose}
      open={Boolean(editTarget)}
      title={translate('invoices.editTitle')}
    >
      <form noValidate className="grid gap-4" key={editTarget?.id} onSubmit={onSubmit}>
        <FormInput
          defaultValue={editTarget?.name}
          error={fieldErrors.name}
          label={translate('invoices.name')}
          name="name"
          required
          requiredLabel={translate('common.required')}
        />
        <FormField error={fieldErrors.description} label={translate('invoices.description')}>
          <Textarea
            defaultValue={editTarget?.description}
            name="description"
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

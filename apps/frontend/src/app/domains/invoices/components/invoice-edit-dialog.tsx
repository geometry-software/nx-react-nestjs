import { CheckCircle2 } from 'lucide-react';
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
  isUpdating,
  onClose,
  onSubmit,
  translate,
}: {
  editTarget: Invoice | null;
  error: string;
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
      <form className="grid gap-4" key={editTarget?.id} onSubmit={onSubmit}>
        <FormInput
          defaultValue={editTarget?.name}
          invalid={Boolean(error)}
          label={translate('invoices.name')}
          name="name"
        />
        <FormField label={translate('invoices.description')}>
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

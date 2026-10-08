import type { SubmitEventHandler } from 'react';
import {
  Button,
  EntityDialog,
  FormField,
  FormInput,
  Textarea,
} from 'geometry-sdk/components';
import type { Product } from '../models/products.model';
import type { Translate } from '@/app/locales/locale';

export function ProductFormDialog({
  busy,
  editTarget,
  invalidFields,
  fieldErrors,
  onClose,
  onSubmit,
  open,
  translate,
}: {
  busy: boolean;
  editTarget: Product | null;
  invalidFields: ReadonlySet<string>;
  fieldErrors: Record<string, string>;
  onClose: () => void;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  open: boolean;
  translate: Translate;
}) {
  return (
    <EntityDialog
      description={translate('products.modalDescription')}
      onClose={onClose}
      open={open}
      title={translate(editTarget ? 'products.editTitle' : 'products.modalTitle')}
    >
      <form
        noValidate
        className="grid gap-4"
        key={editTarget?.id ?? 'create-product'}
        onSubmit={onSubmit}
      >
        <FormInput
          defaultValue={editTarget?.name}
          error={fieldErrors.name}
          invalid={invalidFields.has('name')}
          label={translate('products.productName')}
          name="name"
          placeholder={translate('products.namePlaceholder')}
          required
          requiredLabel={translate('common.required')}
        />
        <FormInput
          defaultValue={editTarget?.price}
          error={fieldErrors.price}
          invalid={invalidFields.has('price')}
          label={translate('products.priceUsd')}
          min="0"
          name="price"
          placeholder="$ 1299.00"
          required
          requiredLabel={translate('common.required')}
          step="0.01"
          type="number"
        />
        <FormInput
          defaultValue={editTarget?.quantity ?? 0}
          error={fieldErrors.quantity}
          invalid={invalidFields.has('quantity')}
          label={translate('products.quantity')}
          min="0"
          name="quantity"
          required
          requiredLabel={translate('common.required')}
          step="1"
          type="number"
        />
        <FormField
          error={fieldErrors.description}
          invalid={invalidFields.has('description')}
          label={translate('products.description')}
        >
          <Textarea
            aria-invalid={invalidFields.has('description')}
            defaultValue={editTarget?.description}
            name="description"
            placeholder={translate('products.descriptionPlaceholder')}
          />
        </FormField>
        <Button
          className="justify-self-end px-6"
          loading={busy}
          loadingLabel={translate(
            editTarget ? 'common.saving' : 'products.publishing',
          )}
          size="lg"
          type="submit"
        >
          {translate(editTarget ? 'common.saveChanges' : 'products.publish')}
        </Button>
      </form>
    </EntityDialog>
  );
}

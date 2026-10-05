import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import {
  Button,
  ConfirmDialog,
  EntityDialog,
  FilterSelect,
  FormField,
  FormInput,
  Notification,
} from 'geometry-sdk/components';
import { confirmDialogLabels } from '@/app/utils/i18n-labels';
import type { Translate } from '@/app/locales/locale';
import { DesignSystemShowcase } from './design-system-showcase';

export function DesignSystemDialogs({
  confirmOpen,
  deleteOpen,
  entityCategory,
  entityOpen,
  onConfirmOpenChange,
  onDeleteOpenChange,
  onEntityCategoryChange,
  onEntityOpenChange,
  translate,
}: {
  confirmOpen: boolean;
  deleteOpen: boolean;
  entityCategory: string;
  entityOpen: boolean;
  onConfirmOpenChange: (open: boolean) => void;
  onDeleteOpenChange: (open: boolean) => void;
  onEntityCategoryChange: (category: string) => void;
  onEntityOpenChange: (open: boolean) => void;
  translate: Translate;
}) {
  return (
    <>
      <DesignSystemShowcase
        badgeLabel={translate('designSystem.reactComponent')}
        name="EntityDialog"
        description={translate('designSystem.description.entityDialog')}
      >
        <Button onClick={() => onEntityOpenChange(true)}>
          {translate('designSystem.openForm')}
        </Button>
        <EntityDialog
          description={translate('designSystem.formDescription')}
          onClose={() => onEntityOpenChange(false)}
          open={entityOpen}
          title={translate('designSystem.addProduct')}
        >
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                fieldClassName="sm:col-span-2"
                inputId="design-system-modal-name"
                label={translate('products.productName')}
                placeholder={translate('products.namePlaceholder')}
                required
                requiredLabel={translate('common.required')}
              />
              <FormInput
                inputId="design-system-modal-inventory"
                label={translate('products.inventoryId')}
                placeholder="INV-2048"
                required
                requiredLabel={translate('common.required')}
              />
              <FormField label={translate('designSystem.category')}>
                <FilterSelect
                  ariaLabel={translate('designSystem.category')}
                  onChange={onEntityCategoryChange}
                  options={[
                    { value: 'electronics', label: translate('designSystem.electronics') },
                    { value: 'office', label: translate('designSystem.office') },
                    { value: 'accessories', label: translate('designSystem.accessories') },
                  ]}
                  value={entityCategory}
                />
              </FormField>
              <FormInput
                inputId="design-system-modal-price"
                label={translate('products.price')}
                min="0"
                placeholder="99.00"
                required
                requiredLabel={translate('common.required')}
                step="0.01"
                type="number"
              />
              <FormInput
                inputId="design-system-modal-quantity"
                label={translate('products.quantity')}
                min="0"
                placeholder="20"
                required
                requiredLabel={translate('common.required')}
                type="number"
              />
              <FormInput
                fieldClassName="sm:col-span-2"
                inputId="design-system-modal-sku"
                label="SKU"
                placeholder="KEYBOARD-WL-BLK"
              />
            </div>
            <Button onClick={() => onEntityOpenChange(false)}>
              <Plus /> {translate('designSystem.addProduct')}
            </Button>
          </div>
        </EntityDialog>
      </DesignSystemShowcase>
      <DesignSystemShowcase
        badgeLabel={translate('designSystem.reactComponent')}
        name="Notification"
        description={translate('designSystem.description.notification')}
      >
        <Notification
          labels={{
            close: translate('common.closeNotification'),
            errorTitle: translate('common.errorTitle'),
            successTitle: translate('common.successTitle'),
          }}
          payload={{
            type: 'success',
            message: translate('designSystem.savedNotification'),
          }}
        />
      </DesignSystemShowcase>
      <DesignSystemShowcase
        badgeLabel={translate('designSystem.reactComponent')}
        className="lg:col-span-2"
        name="ConfirmDialog"
        description={translate('designSystem.description.confirmDialog')}
      >
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onConfirmOpenChange(true)}>
            <CheckCircle2 /> {translate('designSystem.openConfirm')}
          </Button>
          <Button
            onClick={() => onDeleteOpenChange(true)}
            variant="destructive"
          >
            <Trash2 /> {translate('designSystem.openDelete')}
          </Button>
        </div>
        <ConfirmDialog
          labels={{
            title: translate('designSystem.confirmTitle'),
            description: translate('designSystem.confirmDescription', {
              name: '{{name}}',
            }),
            note: translate('designSystem.confirmNote'),
            cancel: translate('common.cancel'),
            pending: translate('designSystem.confirming'),
            confirm: translate('designSystem.confirm'),
          }}
          busy={false}
          itemName={translate('designSystem.operation')}
          onClose={() => onConfirmOpenChange(false)}
          onConfirm={() => onConfirmOpenChange(false)}
          open={confirmOpen}
          tone="confirm"
        />
        <ConfirmDialog
          labels={confirmDialogLabels(translate)}
          busy={false}
          itemName={translate('designSystem.catalogItem')}
          onClose={() => onDeleteOpenChange(false)}
          onConfirm={() => onDeleteOpenChange(false)}
          open={deleteOpen}
        />
      </DesignSystemShowcase>
    </>
  );
}

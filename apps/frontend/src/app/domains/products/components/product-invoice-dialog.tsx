import { FileDown } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  Button,
  EntityDialog,
  FormInput,
  Input,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from 'geometry-sdk/components';
import { formatCurrency } from '@/app/utils/format-value';
import type { Product } from '../models/products.model';
import type { Language } from '@/app/locales/i18n';
import type { Translate } from '@/app/locales/locale';

export function ProductInvoiceDialog({
  busy,
  error,
  invoiceDescription,
  invoiceName,
  language,
  onClose,
  onCreate,
  onDescriptionChange,
  onNameChange,
  onQuantityChange,
  open,
  products,
  quantities,
  total,
  translate,
  validationShown,
}: {
  busy: boolean;
  error: string;
  invoiceDescription: string;
  invoiceName: string;
  language: Language;
  onClose: () => void;
  onCreate: () => void;
  onDescriptionChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onQuantityChange: (productId: string, value: string) => void;
  open: boolean;
  products: Product[];
  quantities: Record<string, string>;
  total: number;
  translate: Translate;
  validationShown: boolean;
}) {
  return (
    <EntityDialog
      className="sm:max-w-3xl"
      description={translate('products.reportModalDescription')}
      onClose={onClose}
      open={open}
      title={translate('products.reportModalTitle')}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          error={
            validationShown && invoiceName.trim().length < 2
              ? translate('products.invoiceNameError')
              : undefined
          }
          invalid={validationShown && invoiceName.trim().length < 2}
          label={translate('products.invoiceName')}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={translate('products.invoiceNamePlaceholder')}
          requiredLabel={translate('common.required')}
          value={invoiceName}
        />
        <FormInput
          label={translate('products.invoiceDescription')}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder={translate('products.invoiceDescriptionPlaceholder')}
          value={invoiceDescription}
        />
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{translate('products.name')}</TableHead>
              <TableHead className="w-36">{translate('products.priceUsd')}</TableHead>
              <TableHead className="w-32">
                {translate('products.reportQuantity')}
              </TableHead>
              <TableHead className="w-40 text-right">
                {translate('products.reportLineTotal')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const quantity = Number(quantities[product.id]) || 0;
              const exceedsStock = quantity > (product.quantity ?? 0);
              const invalidQuantity =
                quantity < 1 || !Number.isInteger(quantity) || exceedsStock;
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {formatCurrency(product.price, language)}
                  </TableCell>
                  <TableCell>
                    <Input
                      aria-invalid={invalidQuantity}
                      aria-label={`${translate('products.reportQuantity')}: ${product.name}`}
                      className="w-20"
                      min="1"
                      onChange={(event) =>
                        onQuantityChange(product.id, event.target.value)
                      }
                      step="1"
                      type="number"
                      value={quantities[product.id] ?? '1'}
                    />
                    <small
                      className={
                        exceedsStock
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }
                    >
                      {exceedsStock
                        ? translate('products.invoiceQuantityError', {
                            count: product.quantity ?? 0,
                          })
                        : translate('products.invoiceAvailable', {
                            count: product.quantity ?? 0,
                          })}
                    </small>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(product.price * quantity, language)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="text-right" colSpan={3}>
                {translate('products.reportTotal')}
              </TableCell>
              <TableCell className="text-right text-base font-bold">
                {formatCurrency(total, language)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        loading={busy}
        loadingLabel={translate('common.saving')}
        onClick={onCreate}
        size="lg"
      >
        <FileDown />
        {translate('products.reportConfirm')}
      </Button>
    </EntityDialog>
  );
}

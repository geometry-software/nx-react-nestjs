import type { SubmitEvent } from 'react';
import {
  Alert,
  AlertDescription,
  Autocomplete,
  Button,
  Checkbox,
  EntityDialog,
  FormField,
  FormInput,
  Label,
  RadioGroup,
  RadioGroupItem,
} from 'geometry-sdk/components';
import type { Language } from '@/app/utils/i18n';
import { formatCurrency } from '@/app/utils/format-value';
import type { Invoice } from '../../invoices/models/invoices.model';
import type { User } from '../../users/models/users.model';
import type {
  CityLocation,
  CountryLocation,
  ShipmentInput,
} from '../models/shipping.model';
import type { Page } from '@/app/models/api.model';
import type { Translate } from '@/app/locales/locale';

export function ShipmentCreateDialog({
  cities,
  citiesLoading,
  countries,
  countriesLoading,
  error,
  fieldErrors,
  invalidFields,
  invoices,
  invoicesLoading,
  isCreating,
  language,
  onCitySearch,
  onCitySelect,
  onClose,
  onCountrySearch,
  onCountrySelect,
  onInvoiceToggle,
  onRecipientChange,
  onSubmit,
  onUserSelect,
  open,
  recipient,
  selectedCountryCode,
  selectedInvoiceIds,
  selectedUserId,
  translate,
  users,
  usersLoading,
}: {
  cities?: CityLocation[];
  citiesLoading: boolean;
  countries?: CountryLocation[];
  countriesLoading: boolean;
  error: string;
  fieldErrors: Record<string, string>;
  invalidFields: ReadonlySet<string>;
  invoices?: Page<Invoice>;
  invoicesLoading: boolean;
  isCreating: boolean;
  language: Language;
  onCitySearch: (value: string) => void;
  onCitySelect: (value: string) => void;
  onClose: () => void;
  onCountrySearch: (value: string) => void;
  onCountrySelect: (value: string, label: string) => void;
  onInvoiceToggle: (invoiceId: string, selected: boolean) => void;
  onRecipientChange: (
    field: keyof ShipmentInput['recipient'],
    value: string,
  ) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onUserSelect: (userId: string) => void;
  open: boolean;
  recipient: ShipmentInput['recipient'];
  selectedCountryCode: string;
  selectedInvoiceIds: ReadonlySet<string>;
  selectedUserId: string;
  translate: Translate;
  users?: Page<User>;
  usersLoading: boolean;
}) {
  return (
    <EntityDialog
      className="content-start"
      description={translate('shipping.modalDescription')}
      onClose={onClose}
      open={open}
      title={translate('shipping.modalTitle')}
    >
      <form noValidate className="grid content-start gap-4" onSubmit={onSubmit}>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormInput
            error={fieldErrors['recipient.name']}
            invalid={invalidFields.has('recipient.name')}
            label={translate('shipping.recipientName')}
            name="recipientName"
            onChange={(event) =>
              onRecipientChange('name', event.target.value)
            }
            required
            requiredLabel={translate('common.required')}
            value={recipient.name}
          />
          <FormInput
            error={fieldErrors['recipient.address']}
            invalid={invalidFields.has('recipient.address')}
            label={translate('shipping.address')}
            name="address"
            onChange={(event) =>
              onRecipientChange('address', event.target.value)
            }
            required
            requiredLabel={translate('common.required')}
            value={recipient.address}
          />
          <FormField
            error={fieldErrors['recipient.country']}
            label={translate('shipping.country')}
            invalid={invalidFields.has('recipient.country')}
            required
            requiredLabel={translate('common.required')}
          >
            <Autocomplete
              ariaLabel={translate('shipping.country')}
              emptyText={translate('shipping.noCountries')}
              invalid={invalidFields.has('recipient.country')}
              loading={countriesLoading}
              onSearchChange={onCountrySearch}
              onSelect={(option) =>
                onCountrySelect(option.value, option.label)
              }
              options={(countries ?? []).map((country) => ({
                value: country.code,
                label: country.name,
              }))}
              placeholder={translate('shipping.countryPlaceholder')}
              required
              selectedValue={selectedCountryCode}
              value={recipient.country}
            />
          </FormField>
          <FormField
            error={fieldErrors['recipient.city']}
            label={translate('shipping.city')}
            invalid={invalidFields.has('recipient.city')}
            required
            requiredLabel={translate('common.required')}
          >
            <Autocomplete
              ariaLabel={translate('shipping.city')}
              disabled={!selectedCountryCode}
              emptyText={translate('shipping.noCities')}
              invalid={invalidFields.has('recipient.city')}
              loading={citiesLoading}
              onSearchChange={onCitySearch}
              onSelect={(option) => onCitySelect(option.label)}
              options={(cities ?? []).map((city) => ({
                value: city.name,
                label: city.name,
              }))}
              placeholder={
                selectedCountryCode
                  ? translate('shipping.cityPlaceholder')
                  : translate('shipping.selectCountryFirst')
              }
              required
              selectedValue={recipient.city}
              value={recipient.city}
            />
          </FormField>
        </div>

        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormField
            error={fieldErrors.invoiceIds}
            invalid={invalidFields.has('invoiceIds')}
            label={translate('shipping.selectInvoices')}
            required
            requiredLabel={translate('common.required')}
          >
            <div
              role="group"
              aria-label={translate('shipping.selectInvoices')}
              aria-invalid={invalidFields.has('invoiceIds') || Boolean(fieldErrors.invoiceIds)}
              aria-required="true"
              className="h-56 space-y-2 overflow-auto rounded-lg border p-3 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20"
            >
              {invoicesLoading ? (
                <p className="text-sm text-muted-foreground">
                  {translate('app.loading')}
                </p>
              ) : (
                (invoices?.data ?? []).map((invoice) => (
                  <InvoiceChoice
                    key={invoice.id}
                    invoice={invoice}
                    language={language}
                    selected={selectedInvoiceIds.has(invoice.id)}
                    onChange={(selected) =>
                      onInvoiceToggle(invoice.id, selected)
                    }
                  />
                ))
              )}
            </div>
            {!invoicesLoading && !invoices?.data.length && (
              <p className="text-sm text-muted-foreground">
                {translate('shipping.noInvoices')}
              </p>
            )}
          </FormField>

          <FormField
            error={fieldErrors.createdByUserId}
            invalid={invalidFields.has('createdByUserId')}
            label={translate('shipping.selectUser')}
            required
            requiredLabel={translate('common.required')}
          >
            <RadioGroup
              aria-label={translate('shipping.selectUser')}
              className="h-56 space-y-2 overflow-auto rounded-lg border p-3"
              onValueChange={onUserSelect}
              required
              value={selectedUserId}
            >
              {usersLoading ? (
                <p className="text-sm text-muted-foreground">
                  {translate('app.loading')}
                </p>
              ) : (
                (users?.data ?? []).map((user) => (
                  <UserChoice key={user.id} user={user} />
                ))
              )}
            </RadioGroup>
          </FormField>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          className="justify-self-end px-6"
          loading={isCreating}
          loadingLabel={translate('common.saving')}
          size="lg"
          type="submit"
        >
          {translate('shipping.create')}
        </Button>
      </form>
    </EntityDialog>
  );
}

function InvoiceChoice({
  invoice,
  language,
  selected,
  onChange,
}: {
  invoice: Invoice;
  language: Language;
  selected: boolean;
  onChange: (selected: boolean) => void;
}) {
  return (
    <Label className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted/50">
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm">{invoice.name}</strong>
        <small className="text-muted-foreground">
          {invoice.items.length} · {formatCurrency(invoice.total, language)}
        </small>
      </span>
    </Label>
  );
}

function UserChoice({ user }: { user: User }) {
  const id = `shipping-user-${user.id}`;
  return (
    <Label
      className="flex cursor-pointer items-center gap-3 rounded-md p-1 hover:bg-muted/50"
      htmlFor={id}
    >
      <RadioGroupItem id={id} value={user.id} />
      <span className="min-w-0">
        <strong className="block truncate text-sm">{user.name}</strong>
        <small className="block truncate text-muted-foreground">
          {user.email}
        </small>
      </span>
    </Label>
  );
}

import { useState } from 'react';
import { useI18n } from '@/app/locales/i18n';
import type { ServiceName } from '@/app/services/api.service';
import type { DesignSystemSampleRow } from '../models/project-info.model';
import { getSwaggerDocuments } from '../service/swagger.service';

export function useProjectInfoFeature() {
  const { translate } = useI18n();
  const [sort, setSort] = useState('createdAt');
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [autocompleteSelectedValue, setAutocompleteSelectedValue] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [entityOpen, setEntityOpen] = useState(false);
  const [entityCategory, setEntityCategory] = useState('electronics');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const rows: DesignSystemSampleRow[] = Array.from({ length: 2 }, (_, index) => ({
    id: `${page}-${index}`,
    name: `${translate('designSystem.catalogItem')} ${(page - 1) * 2 + index + 1}`,
    status: index === 0 ? translate('designSystem.active') : translate('designSystem.draft'),
  }));
  const titles: Record<ServiceName, string> = {
    auth: translate('info.swaggerAuth'),
    products: translate('info.swaggerProducts'),
    shipping: translate('info.swaggerShipping'),
    invoices: translate('info.swaggerInvoices'),
  };
  const documents = getSwaggerDocuments(window.location.origin).map(
    (document) => ({ ...document, title: titles[document.name] }),
  );

  const searchAutocomplete = (value: string) => {
    setAutocompleteValue(value);
    setAutocompleteSelectedValue('');
  };

  const selectAutocomplete = (value: string, label: string) => {
    setAutocompleteSelectedValue(value);
    setAutocompleteValue(label);
  };

  return {
    translate,
    sort,
    setSort,
    autocompleteValue,
    autocompleteSelectedValue,
    searchAutocomplete,
    selectAutocomplete,
    page,
    setPage,
    selectedRows,
    setSelectedRows,
    entityOpen,
    setEntityOpen,
    entityCategory,
    setEntityCategory,
    confirmOpen,
    setConfirmOpen,
    deleteOpen,
    setDeleteOpen,
    rows,
    documents,
    componentCount: 8,
  };
}

import { useState } from 'react';
import { useI18n } from '@/app/utils/i18n';
import type { ServiceName } from '@/app/services/api.service';
import type { DesignSystemSampleRow } from '../models/project-info.model';
import { getSwaggerDocuments } from '../service/swagger.service';
import {
  type DesignSystemFeature,
  DesignSystemFeatureMapper,
} from '../feature/design-system.feature';

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
    componentCount: 8,
  };
}

export function getDataFlowFeature() {
  const { translate } = useI18n();
  return { translate };
}

export function getDesignSystemFeature(): DesignSystemFeature {
  return new DesignSystemFeatureMapper(useProjectInfoFeature());
}

export function getInstallationFeature() {
  const { translate } = useI18n();
  return { translate };
}

export function getSwaggerFeature() {
  const { translate } = useI18n();
  const titles: Record<ServiceName, string> = {
    login: translate('info.swaggerAuth'),
    products: translate('info.swaggerProducts'),
    shipping: translate('info.swaggerShipping'),
    invoices: translate('info.swaggerInvoices'),
  };
  const documents = getSwaggerDocuments(window.location.origin).map(
    (document) => ({ ...document, title: titles[document.name] }),
  );
  return { documents, translate };
}

import type { TranslationValues } from '../locales/locale';

type TableTranslationKey =
  | 'table.empty'
  | 'table.showing'
  | 'table.pagination'
  | 'table.previous'
  | 'table.next'
  | 'table.goToPage'
  | 'table.selectAll'
  | 'table.selectRow';

type ConfirmDialogTranslationKey =
  | 'common.deleteConfirmTitle'
  | 'common.deleteConfirmDescription'
  | 'common.deleteWarning'
  | 'common.cancel'
  | 'common.deleting'
  | 'common.confirmDelete';

type LabelTranslate<TKey extends string> = (
  key: TKey,
  values?: TranslationValues,
) => string;

export function tableLabels(translate: LabelTranslate<TableTranslationKey>) {
  return {
    empty: translate('table.empty'),
    showing: translate('table.showing', {
      first: '{{first}}',
      last: '{{last}}',
      total: '{{total}}',
      items: '{{items}}',
    }),
    pagination: translate('table.pagination'),
    previous: translate('table.previous'),
    next: translate('table.next'),
    goToPage: (page: number) => translate('table.goToPage', { page }),
    selectAll: translate('table.selectAll'),
    selectRow: (id: string) => translate('table.selectRow', { id }),
  };
}

export function confirmDialogLabels(
  translate: LabelTranslate<ConfirmDialogTranslationKey>,
) {
  return {
    title: translate('common.deleteConfirmTitle'),
    description: translate('common.deleteConfirmDescription', {
      name: '{{name}}',
    }),
    warning: translate('common.deleteWarning'),
    cancel: translate('common.cancel'),
    deleting: translate('common.deleting'),
    confirmDelete: translate('common.confirmDelete'),
  };
}

import { Badge, DataTable } from 'geometry-sdk/components';
import { tableLabels } from '@/app/utils/i18n-labels';
import type { Translate } from '@/app/locales/locale';
import type { DesignSystemSampleRow } from '../models/project-info.model';
import { DesignSystemShowcase } from './design-system-showcase';

export function DesignSystemTable({
  onPageChange,
  onSelectedRowsChange,
  page,
  rows,
  selectedRows,
  translate,
}: {
  onPageChange: (page: number) => void;
  onSelectedRowsChange: (rows: Set<string>) => void;
  page: number;
  rows: DesignSystemSampleRow[];
  selectedRows: Set<string>;
  translate: Translate;
}) {
  return (
    <DesignSystemShowcase
      badgeLabel={translate('designSystem.reactComponent')}
      className="lg:col-span-2"
      name="DataTable"
      description={translate('designSystem.description.dataTable')}
    >
      <div className="w-full overflow-hidden">
        <DataTable
          labels={tableLabels(translate)}
          columns={[
            {
              label: translate('designSystem.name'),
              render: (row) => row.name,
              sortValue: (row) => row.name,
            },
            {
              label: translate('designSystem.status'),
              render: (row) => <Badge variant="secondary">{row.status}</Badge>,
              sortValue: (row) => row.status,
            },
          ]}
          itemLabel={translate('designSystem.items')}
          loading={false}
          onPage={onPageChange}
          page={page}
          pages={6}
          pageSize={2}
          rows={rows}
          selectedIds={selectedRows}
          onSelectedIdsChange={onSelectedRowsChange}
          total={12}
        />
      </div>
    </DesignSystemShowcase>
  );
}

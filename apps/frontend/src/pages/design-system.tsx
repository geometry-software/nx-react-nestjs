import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Autocomplete } from '@nx-react-nestjs/components/app/autocomplete';
import { ButtonLoader } from '@nx-react-nestjs/components/app/button-loader';
import { ConfirmDialog } from '@nx-react-nestjs/components/app/confirm-dialog';
import { DataTable } from '@nx-react-nestjs/components/app/data-table';
import { EntityDialog } from '@nx-react-nestjs/components/app/entity-dialog';
import { FilterSelect } from '@nx-react-nestjs/components/app/filter-select';
import { Alert, AlertDescription } from '@nx-react-nestjs/components/ui/alert';
import { Badge } from '@nx-react-nestjs/components/ui/badge';
import { Button } from '@nx-react-nestjs/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nx-react-nestjs/components/ui/card';
import { Input } from '@nx-react-nestjs/components/ui/input';
import { Label } from '@nx-react-nestjs/components/ui/label';
import {
  confirmDialogLabels,
  tableLabels,
  type Language,
  useI18n,
} from '../app/i18n';

type SampleRow = { id: string; name: string; status: string };

const descriptions: Record<Language, Record<string, string>> = {
  en: {
    Button:
      'The main action control. It supports visual variants, sizes, icons, disabled state, and request progress.',
    Input:
      'A single-line field used in search, login, registration, product, and user forms. It has focused and invalid states.',
    Autocomplete:
      'A searchable input with an accessible suggestion list. It supports loading, empty, disabled, and invalid states and is used by dependent country and city fields.',
    FilterSelect:
      'The application select used by sorting, page-size, and role controls. It has a consistent trigger and accessible menu.',
    DataTable:
      'The reusable table used by Products and Users. It renders custom columns, loading and empty states, totals, and pagination.',
    EntityDialog:
      'The shared create and edit modal. It provides a consistent title, description, close behavior, and form area.',
    ConfirmDialog:
      'A reusable confirmation modal for regular and destructive decisions, with matching icon, color, copy, and request state.',
    Notification:
      'A short operation result message with a status icon and an explicit close action.',
  },
  es: {
    Button:
      'Control principal de acción. Admite variantes, tamaños, iconos, estado deshabilitado y progreso de solicitudes.',
    Input:
      'Campo de una línea usado en búsqueda, acceso, registro y formularios. Tiene estados de foco y error.',
    Autocomplete:
      'Campo de búsqueda con una lista accesible de sugerencias. Admite carga, vacío, deshabilitado y error, y se usa para país y ciudad dependientes.',
    FilterSelect:
      'Selector de la aplicación para orden, tamaño de página y roles, con menú accesible y aspecto uniforme.',
    DataTable:
      'Tabla reutilizable de Productos y Usuarios con columnas, carga, estado vacío, totales y paginación.',
    EntityDialog:
      'Modal compartido de creación y edición con título, descripción, cierre y área de formulario uniformes.',
    ConfirmDialog:
      'Modal reutilizable para decisiones normales o destructivas, con icono, color, texto y estado de solicitud adecuados.',
    Notification:
      'Mensaje breve sobre el resultado de una operación, con icono de estado y cierre explícito.',
  },
  pt: {
    Button:
      'Controle principal de ação. Aceita variantes, tamanhos, ícones, estado desabilitado e progresso da solicitação.',
    Input:
      'Campo de uma linha usado em busca, login, cadastro e formulários. Possui estados de foco e erro.',
    Autocomplete:
      'Campo de busca com uma lista acessível de sugestões. Aceita carregamento, vazio, desabilitado e erro, e é usado nos campos dependentes de país e cidade.',
    FilterSelect:
      'Seletor da aplicação para ordenação, tamanho da página e funções, com menu acessível e visual uniforme.',
    DataTable:
      'Tabela reutilizável de Produtos e Usuários com colunas, carregamento, vazio, totais e paginação.',
    EntityDialog:
      'Modal compartilhado de criação e edição com título, descrição, fechamento e formulário uniformes.',
    ConfirmDialog:
      'Modal reutilizável para decisões normais ou destrutivas, com ícone, cor, texto e estado da solicitação adequados.',
    Notification:
      'Mensagem curta sobre o resultado de uma operação, com ícone de estado e ação de fechar.',
  },
};

export function DesignSystem() {
  const { language, t } = useI18n();
  const [sort, setSort] = useState('createdAt');
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [entityOpen, setEntityOpen] = useState(false);
  const [entityCategory, setEntityCategory] = useState('electronics');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const rows: SampleRow[] = Array.from({ length: 2 }, (_, index) => ({
    id: `${page}-${index}`,
    name: `Catalog item ${(page - 1) * 2 + index + 1}`,
    status: index === 0 ? 'Active' : 'Draft',
  }));
  const componentCount = Object.keys(descriptions.en).length;

  return (
    <div className="space-y-8">
      <header>
        <Badge variant="secondary">{t('designSystem.eyebrow')}</Badge>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {t('designSystem.title')}
            </h1>
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
              {t('designSystem.subtitle')}
            </p>
          </div>
          <Badge className="h-8 px-3 text-sm" variant="outline">
            {t('designSystem.componentsCount', { count: componentCount })}
          </Badge>
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">{t('designSystem.appGroup')}</h2>
          <p className="text-muted-foreground">
            {t('designSystem.appGroupText')}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Showcase name="Button" description={descriptions[language].Button}>
            <Button>
              <Plus /> Primary
            </Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">
              <Trash2 /> Destructive
            </Button>
            <Button disabled>
              <ButtonLoader /> Loading…
            </Button>
          </Showcase>

          <Showcase name="Input" description={descriptions[language].Input}>
            <div className="grid w-full max-w-sm gap-2">
              <Label htmlFor="design-system-input">Product name</Label>
              <Input id="design-system-input" placeholder="Enter a value" />
            </div>
            <div className="grid w-full max-w-sm gap-2">
              <Label htmlFor="design-system-invalid">Invalid field</Label>
              <Input
                aria-invalid="true"
                defaultValue="Incorrect value"
                id="design-system-invalid"
              />
            </div>
          </Showcase>

          <Showcase
            className="relative z-20 overflow-visible"
            name="Autocomplete"
            description={descriptions[language].Autocomplete}
          >
            <div className="grid w-full max-w-sm gap-2">
              <Label>Country</Label>
              <Autocomplete
                ariaLabel="Country"
                emptyText="No countries found."
                onSearchChange={setAutocompleteValue}
                onSelect={(option) => setAutocompleteValue(option.label)}
                options={[
                  { value: 'BR', label: 'Brazil' },
                  { value: 'PT', label: 'Portugal' },
                  { value: 'ES', label: 'Spain' },
                  { value: 'US', label: 'United States' },
                ]}
                placeholder="Search country..."
                value={autocompleteValue}
              />
            </div>
          </Showcase>

          <Showcase
            name="FilterSelect"
            description={descriptions[language].FilterSelect}
          >
            <div className="grid gap-2">
              <Label>Sort field</Label>
              <FilterSelect
                ariaLabel="Sort field"
                onChange={setSort}
                options={[
                  { value: 'createdAt', label: 'Created date' },
                  { value: 'updatedAt', label: 'Updated date' },
                  { value: 'name', label: 'Name' },
                ]}
                value={sort}
              />
            </div>
          </Showcase>

          <Showcase
            className="lg:col-span-2"
            name="DataTable"
            description={descriptions[language].DataTable}
          >
            <div className="w-full overflow-hidden">
              <DataTable
                labels={tableLabels(t)}
                columns={[
                  { label: 'Name', render: (row) => row.name },
                  {
                    label: 'Status',
                    render: (row) => (
                      <Badge variant="secondary">{row.status}</Badge>
                    ),
                  },
                ]}
                itemLabel="items"
                loading={false}
                onPage={setPage}
                page={page}
                pages={6}
                pageSize={2}
                rows={rows}
                selectedIds={selectedRows}
                onSelectedIdsChange={setSelectedRows}
                total={12}
              />
            </div>
          </Showcase>

          <Showcase
            name="EntityDialog"
            description={descriptions[language].EntityDialog}
          >
            <Button onClick={() => setEntityOpen(true)}>Open form modal</Button>
            <EntityDialog
              description="A reusable modal with a real application form."
              onClose={() => setEntityOpen(false)}
              open={entityOpen}
              title="Add product"
            >
              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="design-system-modal-name">
                      Product name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="design-system-modal-name"
                      placeholder="Wireless keyboard"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="design-system-modal-inventory">
                      Inventory ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="design-system-modal-inventory"
                      placeholder="INV-2048"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <FilterSelect
                      ariaLabel="Product category"
                      onChange={setEntityCategory}
                      options={[
                        { value: 'electronics', label: 'Electronics' },
                        { value: 'office', label: 'Office' },
                        { value: 'accessories', label: 'Accessories' },
                      ]}
                      value={entityCategory}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="design-system-modal-price">
                      Price <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="design-system-modal-price"
                      min="0"
                      placeholder="99.00"
                      step="0.01"
                      type="number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="design-system-modal-quantity">
                      Quantity <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="design-system-modal-quantity"
                      min="0"
                      placeholder="20"
                      type="number"
                    />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="design-system-modal-sku">SKU</Label>
                    <Input
                      id="design-system-modal-sku"
                      placeholder="KEYBOARD-WL-BLK"
                    />
                  </div>
                </div>
                <Button onClick={() => setEntityOpen(false)}>
                  <Plus /> Add product
                </Button>
              </div>
            </EntityDialog>
          </Showcase>

          <Showcase
            name="Notification"
            description={descriptions[language].Notification}
          >
            <Alert className="flex items-center gap-3 px-4 py-3">
              <CheckCircle2 className="size-5 shrink-0 translate-y-0" />
              <AlertDescription>
                Product changes were saved successfully.
              </AlertDescription>
            </Alert>
          </Showcase>

          <Showcase
            className="lg:col-span-2"
            name="ConfirmDialog"
            description={descriptions[language].ConfirmDialog}
          >
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setConfirmOpen(true)}>
                <CheckCircle2 /> Open confirm dialog
              </Button>
              <Button
                onClick={() => setDeleteOpen(true)}
                variant="destructive"
              >
                <Trash2 /> Open delete dialog
              </Button>
            </div>
            <ConfirmDialog
              labels={{
                title: 'Confirm action',
                description: 'Continue with {{name}}?',
                note: 'You can review the result after completion.',
                cancel: 'Cancel',
                pending: 'Confirming…',
                confirm: 'Confirm',
              }}
              busy={false}
              itemName="this operation"
              onClose={() => setConfirmOpen(false)}
              onConfirm={() => setConfirmOpen(false)}
              open={confirmOpen}
              tone="confirm"
            />
            <ConfirmDialog
              labels={confirmDialogLabels(t)}
              busy={false}
              itemName="Catalog item"
              onClose={() => setDeleteOpen(false)}
              onConfirm={() => setDeleteOpen(false)}
              open={deleteOpen}
            />
          </Showcase>

        </div>
      </section>
    </div>
  );
}

function Showcase({
  name,
  description,
  children,
  className = '',
}: {
  name: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`h-full ${className}`}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-mono text-lg">{name}</CardTitle>
          <Badge variant="outline">React component</Badge>
        </div>
        <CardDescription className="leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-24 flex-wrap items-center gap-3 rounded-lg border bg-muted/20 p-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

import {
  ArrowDown,
  Boxes,
  Braces,
  Database,
  FileText,
  Globe2,
  Package,
  Palette,
  Server,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DataFlowItem = {
  title: string;
  description: string;
  port?: string;
};

export type DataFlowDiagramProps = {
  label: string;
  workspaceTitle: string;
  workspaceDescription: string;
  frontendTitle: string;
  frontendDescription: string;
  frontendModules: DataFlowItem[];
  transportLabel: string;
  backendTitle: string;
  backendDescription: string;
  authorizationServices: DataFlowItem[];
  services: DataFlowItem[];
  persistenceTitle: string;
  persistenceDescription: string;
  database: DataFlowItem;
  externalTitle: string;
  externalDescription: string;
  externalApis: DataFlowItem[];
};

const frontendIcons: LucideIcon[] = [Package, FileText, Truck, ShieldCheck];
const serviceIcons: LucideIcon[] = [Package, FileText, Truck];

export function DataFlowDiagram({
  label,
  workspaceTitle,
  workspaceDescription,
  frontendTitle,
  frontendDescription,
  frontendModules,
  transportLabel,
  backendTitle,
  backendDescription,
  authorizationServices,
  services,
  persistenceTitle,
  persistenceDescription,
  database,
  externalTitle,
  externalDescription,
  externalApis,
}: DataFlowDiagramProps) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      role="img"
      aria-label={label}
    >
      <LayerHeading
        icon={Boxes}
        title={workspaceTitle}
        description={workspaceDescription}
        tone="neutral"
      />

      <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 sm:p-6">
        <LayerHeading
          icon={Braces}
          title={frontendTitle}
          description={frontendDescription}
          tone="blue"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {frontendModules.map((item, index) => (
            <DiagramCard
              key={item.title}
              item={item}
              icon={frontendIcons[index] ?? Palette}
              tone="blue"
            />
          ))}
        </div>
      </section>

      <FlowArrow label={transportLabel} />

      <section className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 sm:p-6">
        <LayerHeading
          icon={Server}
          title={backendTitle}
          description={backendDescription}
          tone="violet"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {authorizationServices.map((item, index) => (
            <DiagramCard
              key={item.title}
              item={item}
              icon={index === 0 ? ShieldCheck : Users}
              tone="violet"
            />
          ))}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {services.map((item, index) => (
            <DiagramCard
              key={item.title}
              item={item}
              icon={serviceIcons[index] ?? Database}
              tone="violet"
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <div>
          <FlowArrow label="TypeORM" />
          <section className="h-[calc(100%-4rem)] rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-6">
            <LayerHeading
              icon={Database}
              title={persistenceTitle}
              description={persistenceDescription}
              tone="green"
            />
            <div className="mt-5">
              <DiagramCard item={database} icon={Database} tone="green" />
            </div>
          </section>
        </div>
        <div>
          <FlowArrow label="Axios · HTTP" />
          <section className="h-[calc(100%-4rem)] rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-6">
            <LayerHeading
              icon={Globe2}
              title={externalTitle}
              description={externalDescription}
              tone="green"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {externalApis.map((item) => (
                <DiagramCard
                  key={item.title}
                  item={item}
                  icon={Globe2}
                  tone="green"
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function LayerHeading({
  icon: Icon,
  title,
  description,
  tone,
  port,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: 'neutral' | 'blue' | 'violet' | 'green';
  port?: string;
  compact?: boolean;
}) {
  const toneClass = {
    neutral: 'text-slate-900',
    blue: 'text-blue-700',
    violet: 'text-violet-700',
    green: 'text-emerald-700',
  }[tone];
  return (
    <div className="flex items-start gap-3">
      <Icon className={`mt-0.5 size-5 shrink-0 ${toneClass}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <strong className={compact ? 'text-base' : 'text-lg'}>{title}</strong>
          {port && (
            <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
              {port}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function DiagramCard({
  item,
  icon: Icon,
  tone,
}: {
  item: DataFlowItem;
  icon: LucideIcon;
  tone: 'blue' | 'violet' | 'green';
}) {
  const iconClass = {
    blue: 'text-blue-600',
    violet: 'text-violet-600',
    green: 'text-emerald-600',
  }[tone];
  const borderClass = {
    blue: 'border-blue-200',
    violet: 'border-violet-200',
    green: 'border-emerald-200',
  }[tone];
  return (
    <article className={`rounded-xl border bg-white p-4 text-center ${borderClass}`}>
      <Icon className={`mx-auto size-5 ${iconClass}`} />
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <strong className="text-sm">{item.title}</strong>
        {item.port && (
          <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
            {item.port}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {item.description}
      </p>
    </article>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex h-16 flex-col items-center justify-center text-xs font-medium text-muted-foreground">
      <ArrowDown className="size-5" />
      <span>{label}</span>
    </div>
  );
}

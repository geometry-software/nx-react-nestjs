import {
  BookOpen,
  Boxes,
  CircleHelp,
  Download,
  FileCode2,
  FileText,
  Gauge,
  KeyRound,
  Package,
  Truck,
  UserRound,
  Users,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { LanguageSwitcher } from './language-switcher';

export type RequestActivityView = {
  active: boolean;
  duration: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | null;
  visible: boolean;
};

const requestMethodStyles: Record<
  Exclude<RequestActivityView['method'], null>,
  string
> = {
  GET: 'border-blue-200 bg-blue-50 text-blue-700',
  DELETE: 'border-red-200 bg-red-50 text-red-700',
  POST: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PUT: 'border-amber-200 bg-amber-50 text-amber-700',
};

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`;

export function AppShell({
  requestActivity,
  i18n,
}: {
  requestActivity: RequestActivityView;
  i18n: {
    language: 'en' | 'es' | 'pt';
    setLanguage: (language: 'en' | 'es' | 'pt') => void;
    t: (key: string, values?: Record<string, string | number>) => string;
  };
}) {
  const location = useLocation();
  const { t } = i18n;
  const isAuth = location.pathname === '/auth';
  const isInfo = location.pathname === '/info';
  const isProjectInfo =
    location.pathname === '/swagger' || location.pathname === '/installation';
  const isDesignSystem = location.pathname === '/design-system';
  const isProjectPage = isInfo || isProjectInfo || isDesignSystem;

  if (isAuth) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-8">
          <Brand />
          <LanguageSwitcher
            language={i18n.language}
            setLanguage={i18n.setLanguage}
            label={t('language.label')}
          />
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 md:grid md:grid-cols-[304px_minmax(0,1fr)]">
      <aside className="border-b bg-background p-4 md:min-h-screen md:border-r md:border-b-0 md:p-0">
        <div className="md:flex md:h-16 md:items-center md:border-b md:px-4">
          <Brand />
        </div>
        <Separator className="my-5 md:hidden" />
        <nav className="grid gap-1 md:p-4" aria-label="Primary navigation">
          <NavGroup label={t('nav.business')}>
            <NavLink
              className={navClass}
              to="/products?page=1&limit=10&sort=createdAt&order=desc"
            >
              <Package />
              {t('nav.products')}
            </NavLink>
            <NavLink
              className={navClass}
              to="/invoices?page=1&limit=10&sort=createdAt&order=desc"
            >
              <FileText />
              {t('nav.invoices')}
            </NavLink>
            <NavLink
              className={navClass}
              to="/shipping?page=1&limit=10&sort=createdAt&order=desc"
            >
              <Truck />
              {t('nav.shipping')}
            </NavLink>
          </NavGroup>
          <NavGroup label={t('nav.authorization')}>
            <NavLink className={navClass} to="/auth">
              <KeyRound />
              {t('nav.auth')}
            </NavLink>
            <NavLink
              className={navClass}
              to="/users?page=1&limit=10&sort=createdAt&order=desc"
            >
              <Users />
              {t('nav.users')}
            </NavLink>
          </NavGroup>
          <NavGroup label={t('nav.project')}>
            <NavLink className={navClass} to="/installation">
              <Download />
              {t('nav.installation')}
            </NavLink>
            <NavLink className={navClass} to="/design-system">
              <BookOpen />
              {t('nav.designSystem')}
            </NavLink>
            <NavLink className={navClass} to="/info">
              <CircleHelp />
              {t('nav.info')}
            </NavLink>
            <NavLink className={navClass} to="/swagger">
              <FileCode2 />
              {t('info.swaggerTab')}
            </NavLink>
          </NavGroup>
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <Boxes className="text-primary" />
            <span>
              {t(isProjectPage ? 'header.project' : 'header.catalog')}
            </span>
            <span>/</span>
            <strong className="text-foreground">
              {t(
                isDesignSystem
                  ? 'header.components'
                  : isInfo
                    ? 'header.overview'
                    : isProjectInfo
                      ? 'header.project'
                      : 'header.console',
              )}
            </strong>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              aria-label={
                requestActivity.visible
                  ? t(
                      requestActivity.active
                        ? 'header.requestInProgress'
                        : 'header.requestCompleted',
                      {
                        duration: requestActivity.duration,
                        method: requestActivity.method ?? 'GET',
                      },
                    )
                  : undefined
              }
              className={`flex h-8 gap-2 px-2.5 text-sm ${requestMethodStyles[requestActivity.method ?? 'GET']} ${requestActivity.active ? 'animate-pulse' : ''}`}
              variant="outline"
            >
              <Gauge />
              {requestActivity.visible &&
                t('header.lastRequest', {
                  duration: requestActivity.duration,
                  method: requestActivity.method ?? 'GET',
                })}
            </Badge>
            <LanguageSwitcher
              language={i18n.language}
              setLanguage={i18n.setLanguage}
              label={t('language.label')}
            />
            <Avatar>
              <AvatarFallback>
                <UserRound />
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">
        NX
      </span>
      <strong className="whitespace-nowrap text-lg">NX Monorepo</strong>
      <Badge className="h-7 px-2.5 text-sm" variant="outline">
        v2.4
      </Badge>
    </div>
  );
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4 grid gap-1">
      <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

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
import {
  Avatar,
  AvatarFallback,
  Badge,
  LanguageSwitcher,
  Separator,
  type LanguageOption,
} from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';
import { RequestActivityView, requestMethodStyles } from './models/request-activity.model';

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
    language: string;
    languages: readonly LanguageOption[];
    setLanguage: (language: string) => void;
    translate: Translate;
  };
}) {
  const location = useLocation();
  const { translate } = i18n;
  const isAuth = location.pathname === '/auth';
  const breadcrumb = getBreadcrumb(location.pathname);

  if (isAuth) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="flex h-16 items-center gap-6 border-b bg-background px-4 md:px-8">
          <Brand />
          <HeaderBreadcrumb breadcrumb={breadcrumb} translate={translate} />
          <div className="ml-auto">
            <LanguageSwitcher
              language={i18n.language}
              languages={i18n.languages}
              setLanguage={i18n.setLanguage}
              label={translate('app.languageLabel')}
            />
          </div>
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
          <NavGroup label={translate('nav.business')}>
            <NavLink
              className={navClass}
              to="/products?page=1&limit=10&sort=createdAt&order=desc"
            >
              <Package />
              {translate('nav.products')}
            </NavLink>
            <NavLink
              className={navClass}
              to="/invoices?page=1&limit=10&sort=createdAt&order=desc"
            >
              <FileText />
              {translate('nav.invoices')}
            </NavLink>
            <NavLink
              className={navClass}
              to="/shipping?page=1&limit=10&sort=createdAt&order=desc"
            >
              <Truck />
              {translate('nav.shipping')}
            </NavLink>
          </NavGroup>
          <NavGroup label={translate('nav.authorization')}>
            <NavLink className={navClass} to="/auth">
              <KeyRound />
              {translate('nav.auth')}
            </NavLink>
            <NavLink
              className={navClass}
              to="/users?page=1&limit=10&sort=createdAt&order=desc"
            >
              <Users />
              {translate('nav.users')}
            </NavLink>
          </NavGroup>
          <NavGroup label={translate('nav.project')}>
            <NavLink className={navClass} to="/installation">
              <Download />
              {translate('nav.installation')}
            </NavLink>
            <NavLink className={navClass} to="/design-system">
              <BookOpen />
              {translate('nav.designSystem')}
            </NavLink>
            <NavLink className={navClass} to="/info">
              <CircleHelp />
              {translate('nav.info')}
            </NavLink>
            <NavLink className={navClass} to="/swagger">
              <FileCode2 />
              {translate('info.swaggerTab')}
            </NavLink>
          </NavGroup>
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <HeaderBreadcrumb breadcrumb={breadcrumb} translate={translate} />
          <div className="ml-auto flex items-center gap-2">
            <Badge
              aria-label={
                requestActivity.visible
                  ? translate(
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
                translate('header.lastRequest', {
                  duration: requestActivity.duration,
                  method: requestActivity.method ?? 'GET',
                })}
            </Badge>
            <LanguageSwitcher
              language={i18n.language}
              languages={i18n.languages}
              setLanguage={i18n.setLanguage}
              label={translate('app.languageLabel')}
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
        v2.5
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

type Breadcrumb = {
  domainKey: Parameters<Translate>[0];
  sectionKey: Parameters<Translate>[0];
};

function getBreadcrumb(pathname: string): Breadcrumb {
  switch (pathname) {
    case '/products':
      return { domainKey: 'nav.business', sectionKey: 'nav.products' };
    case '/invoices':
      return { domainKey: 'nav.business', sectionKey: 'nav.invoices' };
    case '/shipping':
      return { domainKey: 'nav.business', sectionKey: 'nav.shipping' };
    case '/users':
      return { domainKey: 'nav.authorization', sectionKey: 'nav.users' };
    case '/auth':
      return { domainKey: 'nav.authorization', sectionKey: 'nav.auth' };
    case '/installation':
      return { domainKey: 'nav.project', sectionKey: 'nav.installation' };
    case '/design-system':
      return { domainKey: 'nav.project', sectionKey: 'nav.designSystem' };
    case '/swagger':
      return { domainKey: 'nav.project', sectionKey: 'info.swaggerTab' };
    case '/info':
    default:
      return { domainKey: 'nav.project', sectionKey: 'nav.info' };
  }
}

function HeaderBreadcrumb({
  breadcrumb,
  translate,
}: {
  breadcrumb: Breadcrumb;
  translate: Translate;
}) {
  return (
    <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
      <Boxes className="text-primary" />
      <span>{translate(breadcrumb.domainKey)}</span>
      <span>/</span>
      <strong className="text-foreground">{translate(breadcrumb.sectionKey)}</strong>
    </div>
  );
}

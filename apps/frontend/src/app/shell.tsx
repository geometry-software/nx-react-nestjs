import {
  Boxes,
  Gauge,
  Moon,
  Sun,
  UserRound,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  LanguageSwitcher,
  Separator,
  useTheme,
  type LanguageOption,
} from 'geometry-sdk/components';
import type { Translate } from '@/app/locales/locale';
import { RequestActivityView, requestMethodStyles } from './models/request-activity.model';
import {
  appRoutes,
  navigationGroups,
} from './models/navigation.model';
import { getNavigationRoute } from './utils/navigation';

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
  const { theme, toggleTheme } = useTheme();
  const { translate } = i18n;
  const isAuth = location.pathname === '/auth';
  const breadcrumb = getBreadcrumb(location.pathname);

  if (isAuth) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="flex h-16 items-center gap-6 border-b bg-background px-4 md:px-8">
          <Brand />
          <HeaderBreadcrumb breadcrumb={breadcrumb} translate={translate} />
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher
              language={i18n.language}
              languages={i18n.languages}
              setLanguage={i18n.setLanguage}
              label={translate('app.languageLabel')}
            />
            <ThemeToggle
              theme={theme}
              toggleTheme={toggleTheme}
              translate={translate}
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
    <div className="min-h-screen bg-muted/30 md:grid md:grid-cols-[234px_minmax(0,1fr)]">
      <aside className="border-b bg-background p-4 md:min-h-screen md:border-r md:border-b-0 md:p-0">
        <div className="md:flex md:h-16 md:items-center md:border-b md:px-2">
          <Brand compact />
        </div>
        <Separator className="my-5 md:hidden" />
        <nav className="grid gap-1 md:p-4" aria-label="Primary navigation">
          {navigationGroups.map((group) => {
            const routes = appRoutes.filter((route) => route.group === group);
            const groupName = routes[0]?.groupName;

            if (!groupName) return null;

            return (
              <NavGroup key={group} label={translate(groupName)}>
                {routes.map(({ href, icon: Icon, id, name, styles }) => (
                  <NavLink className={navClass} key={id} to={href}>
                    <Icon className={styles.icon} />
                    {translate(name)}
                  </NavLink>
                ))}
              </NavGroup>
            );
          })}
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
            <ThemeToggle
              theme={theme}
              toggleTheme={toggleTheme}
              translate={translate}
            />
            <NavLink
              aria-label={translate('nav.auth')}
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              to="/auth"
            >
              <Avatar>
                <AvatarFallback>
                  <UserRound />
                </AvatarFallback>
              </Avatar>
            </NavLink>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ThemeToggle({
  theme,
  toggleTheme,
  translate,
}: {
  theme: 'light' | 'dark';
  toggleTheme(): void;
  translate: Translate;
}) {
  const dark = theme === 'dark';
  const label = translate(
    dark ? 'app.enableLightTheme' : 'app.enableDarkTheme',
  );

  return (
    <Button
      aria-label={label}
      aria-pressed={dark}
      onClick={toggleTheme}
      size="icon"
      title={label}
      type="button"
      variant="outline"
    >
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      <span
        className={`grid shrink-0 place-items-center rounded-xl bg-primary font-bold text-primary-foreground ${compact ? 'size-9' : 'size-10'}`}
      >
        NX
      </span>
      <strong className={`whitespace-nowrap ${compact ? 'text-sm' : 'text-lg'}`}>
        NX Monorepo
      </strong>
      <Badge
        className={compact ? 'h-6 px-2 text-xs' : 'h-7 px-2.5 text-sm'}
        variant="outline"
      >
        v2.5
      </Badge>
    </div>
  );
}

function NavGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
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
  const route = getNavigationRoute(pathname, appRoutes);
  return { domainKey: route.groupName, sectionKey: route.name };
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

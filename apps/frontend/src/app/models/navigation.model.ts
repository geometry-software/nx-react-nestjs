import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import {
  BookOpen,
  Download,
  FileCode2,
  FileText,
  KeyRound,
  Package,
  Truck,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { TranslationKey } from '../locales/locale';
import { listRoutes } from '../utils/navigation';

export type NavigationGroup = 'business' | 'authorization' | 'project';

export const navigationGroups: readonly NavigationGroup[] = [
  'business',
  'authorization',
  'project',
];

export type AppRouteModel = {
  id: string;
  path: string;
  href: string;
  name: TranslationKey;
  group: NavigationGroup;
  groupName: TranslationKey;
  icon: LucideIcon;
  styles: {
    icon: string;
  };
  component: LazyExoticComponent<ComponentType>;
};

export const appRoutes = [
  {
    id: 'products',
    path: listRoutes.products.path,
    href: listRoutes.products.href,
    name: 'nav.products',
    group: 'business',
    groupName: 'nav.business',
    icon: Package,
    styles: { icon: 'size-5' },
    component: lazy(() =>
      import('../domains/products/pages/products.page.tsx').then(
        ({ Products }) => ({ default: Products }),
      ),
    ),
  },
  {
    id: 'invoices',
    path: listRoutes.invoices.path,
    href: listRoutes.invoices.href,
    name: 'nav.invoices',
    group: 'business',
    groupName: 'nav.business',
    icon: FileText,
    styles: { icon: 'size-5' },
    component: lazy(() =>
      import('../domains/invoices/pages/invoices.page.tsx').then(
        ({ Invoices }) => ({ default: Invoices }),
      ),
    ),
  },
  {
    id: 'shipping',
    path: listRoutes.shipping.path,
    href: listRoutes.shipping.href,
    name: 'nav.shipping',
    group: 'business',
    groupName: 'nav.business',
    icon: Truck,
    styles: { icon: 'size-5' },
    component: lazy(() =>
      import('../domains/shipping/pages/shipping.page.tsx').then(
        ({ Shipping }) => ({ default: Shipping }),
      ),
    ),
  },
  {
    id: 'auth',
    path: 'auth',
    href: '/auth',
    name: 'nav.auth',
    group: 'authorization',
    groupName: 'nav.authorization',
    icon: KeyRound,
    styles: { icon: 'size-5' },
    component: lazy(() =>
      import('../domains/auth/pages/auth.page.tsx').then(({ Auth }) => ({
        default: Auth,
      })),
    ),
  },
  {
    id: 'users',
    path: listRoutes.users.path,
    href: listRoutes.users.href,
    name: 'nav.users',
    group: 'authorization',
    groupName: 'nav.authorization',
    icon: Users,
    styles: { icon: 'size-5' },
    component: lazy(() =>
      import('../domains/users/pages/users.page.tsx').then(({ Users }) => ({
        default: Users,
      })),
    ),
  },
  {
    id: 'installation',
    path: 'installation',
    href: '/installation',
    name: 'nav.installation',
    group: 'project',
    groupName: 'nav.project',
    icon: Download,
    styles: { icon: 'size-5' },
    component: lazy(() =>
      import('../domains/project-info/pages/installation.page.tsx').then(
        ({ Installation }) => ({ default: Installation }),
      ),
    ),
  },
  {
    id: 'design-system',
    path: 'design-system',
    href: '/design-system',
    name: 'nav.designSystem',
    group: 'project',
    groupName: 'nav.project',
    icon: BookOpen,
    styles: { icon: 'size-5' },
    component: lazy(() =>
      import('../domains/project-info/pages/design-system.page.tsx').then(
        ({ DesignSystem }) => ({ default: DesignSystem }),
      ),
    ),
  },
  {
    id: 'data-flow',
    path: 'info',
    href: '/info',
    name: 'nav.info',
    group: 'project',
    groupName: 'nav.project',
    icon: Workflow,
    styles: { icon: 'size-5' },
    component: lazy(() =>
      import('../domains/project-info/pages/data-flow.page.tsx').then(
        ({ DataFlow }) => ({ default: DataFlow }),
      ),
    ),
  },
  {
    id: 'swagger',
    path: 'swagger',
    href: '/swagger',
    name: 'info.swaggerTab',
    group: 'project',
    groupName: 'nav.project',
    icon: FileCode2,
    styles: { icon: 'size-5' },
    component: lazy(() =>
      import('../domains/project-info/pages/swagger.page.tsx').then(
        ({ Swagger }) => ({ default: Swagger }),
      ),
    ),
  },
] as const satisfies readonly AppRouteModel[];

import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/app-shell';
import { isLanguage, languageOptions } from './locales/i18n.ts';
import { useI18n } from './locales/i18n.ts';
import { useRequestActivity } from './hooks/use-request-activity';

const Products = lazy(() =>
  import('./domains/products/pages/products.page.tsx').then(({ Products }) => ({
    default: Products,
  })),
);
const Users = lazy(() =>
  import('./domains/users/pages/users.page.tsx').then(({ Users }) => ({
    default: Users,
  })),
);
const Shipping = lazy(() =>
  import('./domains/shipping/pages/shipping.page.tsx').then(({ Shipping }) => ({
    default: Shipping,
  })),
);
const Invoices = lazy(() =>
  import('./domains/invoices/pages/invoices.page.tsx').then(({ Invoices }) => ({
    default: Invoices,
  })),
);
const Auth = lazy(() =>
  import('./domains/auth/pages/auth.page.tsx').then(({ Auth }) => ({
    default: Auth,
  })),
);
const DataFlow = lazy(() =>
  import('./domains/project-info/pages/data-flow.page.tsx').then(({ DataFlow }) => ({
    default: DataFlow,
  })),
);
const Swagger = lazy(() =>
  import('./domains/project-info/pages/swagger.page.tsx').then(({ Swagger }) => ({
    default: Swagger,
  })),
);
const Installation = lazy(() =>
  import('./domains/project-info/pages/installation.page.tsx').then(
    ({ Installation }) => ({ default: Installation }),
  ),
);
const DesignSystem = lazy(() =>
  import('./domains/project-info/pages/design-system.page.tsx').then(
    ({ DesignSystem }) => ({ default: DesignSystem }),
  ),
);
export function App() {
  const { language, setLanguage, translate } = useI18n();
  const requestActivity = useRequestActivity();
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-muted-foreground">
          {translate('app.loading')}
        </div>
      }
    >
      <Routes>
        <Route
          element={
            <AppShell
              i18n={{
                language,
                languages: languageOptions,
                setLanguage: (value) => {
                  if (isLanguage(value)) setLanguage(value);
                },
                translate,
              }}
              requestActivity={requestActivity}
            />
          }
        >
          <Route
            index
            element={
              <Navigate
                to="/products?page=1&limit=10&sort=createdAt&order=desc"
                replace
              />
            }
          />
          <Route path="products" element={<Products />} />
          <Route path="users" element={<Users />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="auth" element={<Auth />} />
          <Route path="info" element={<DataFlow />} />
          <Route path="swagger" element={<Swagger />} />
          <Route path="installation" element={<Installation />} />
          <Route
            path="project-info"
            element={<Navigate to="/swagger" replace />}
          />
          <Route path="design-system" element={<DesignSystem />} />
          <Route
            path="storybook"
            element={<Navigate to="/design-system" replace />}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
export default App;

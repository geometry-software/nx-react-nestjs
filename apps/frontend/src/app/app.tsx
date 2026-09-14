import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@nx-react-nestjs/components/app/app-shell';
import { useRequestActivity } from './request-activity';
import { useI18n } from './i18n';

const Products = lazy(() =>
  import('../pages/products').then(({ Products }) => ({ default: Products })),
);
const Users = lazy(() =>
  import('../pages/users').then(({ Users }) => ({ default: Users })),
);
const Shipping = lazy(() =>
  import('../pages/shipping').then(({ Shipping }) => ({ default: Shipping })),
);
const Invoices = lazy(() =>
  import('../pages/invoices').then(({ Invoices }) => ({ default: Invoices })),
);
const Auth = lazy(() =>
  import('../pages/auth').then(({ Auth }) => ({ default: Auth })),
);
const Info = lazy(() =>
  import('../pages/info').then(({ Info }) => ({ default: Info })),
);
const ProjectInfo = lazy(() =>
  import('../pages/swagger').then(({ ProjectInfo }) => ({
    default: ProjectInfo,
  })),
);
const Installation = lazy(() =>
  import('../pages/installation').then(({ Installation }) => ({
    default: Installation,
  })),
);
const DesignSystem = lazy(() =>
  import('../pages/design-system').then(({ DesignSystem }) => ({
    default: DesignSystem,
  })),
);
export function App() {
  const { language, setLanguage, t } = useI18n();
  const requestActivity = useRequestActivity();
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-muted-foreground">
          {t('app.loading')}
        </div>
      }
    >
      <Routes>
        <Route
          element={
            <AppShell
              i18n={{
                language,
                setLanguage,
                t: (key, values) => t(key as never, values),
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
          <Route path="info" element={<Info />} />
          <Route path="swagger" element={<ProjectInfo />} />
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

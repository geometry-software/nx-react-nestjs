import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './shell';
import { isLanguage, languageOptions, useI18n } from './utils/i18n';
import { useRequestActivity } from './hooks/use-request-activity';
import { appRoutes } from './models/navigation.model';
import { VerifyEmailPage } from './domains/auth/pages/verify-email.page';
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
                to={appRoutes[0].href}
                replace
              />
            }
          />
          {appRoutes.map(({ component: Page, id, path }) => (
            <Route key={id} path={path} element={<Page />} />
          ))}
          <Route path="auth" element={<LegacyAuthRedirect />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route
            path="project-info"
            element={<Navigate to="/info" replace />}
          />
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

function LegacyAuthRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/login${search}`} replace />;
}

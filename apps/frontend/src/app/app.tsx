import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './shell';
import { isLanguage, languageOptions, useI18n } from './utils/i18n';
import { useRequestActivity } from './hooks/use-request-activity';
import { appRoutes } from './models/navigation.model';
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
          <Route
            path="project-info"
            element={<Navigate to="/swagger" replace />}
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

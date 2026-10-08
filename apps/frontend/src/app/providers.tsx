import type { ReactNode } from 'react';
import { ApiProvider } from '@reduxjs/toolkit/query/react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider, ThemeProvider, TooltipProvider } from 'geometry-sdk/components';
import { I18nProvider } from './utils/i18n';
import { getDataService } from './services/data.service';
import { FirebaseSessionProvider } from './providers/firebase-session.provider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ApiProvider api={getDataService().apiService.api}>
      <ThemeProvider storageKey="nx-theme">
        <I18nProvider>
          {({ translate }) => (
            <NotificationProvider
              labels={{
                close: translate('common.closeNotification'),
                errorTitle: translate('common.errorTitle'),
                successTitle: translate('common.successTitle'),
              }}
            >
              <TooltipProvider>
                <FirebaseSessionProvider>
                  <BrowserRouter>{children}</BrowserRouter>
                </FirebaseSessionProvider>
              </TooltipProvider>
            </NotificationProvider>
          )}
        </I18nProvider>
      </ThemeProvider>
    </ApiProvider>
  );
}

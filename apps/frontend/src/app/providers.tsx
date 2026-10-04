import type { ReactNode } from 'react';
import { ApiProvider } from '@reduxjs/toolkit/query/react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider, TooltipProvider } from 'geometry-sdk/components';
import { I18nProvider, useI18n } from '../i18n';
import { technicalServices } from '../services/technical-services.service';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ApiProvider api={technicalServices.apiService.api}>
      <I18nProvider>
        <InterfaceProviders>{children}</InterfaceProviders>
      </I18nProvider>
    </ApiProvider>
  );
}

function InterfaceProviders({ children }: { children: ReactNode }) {
  const { translate } = useI18n();

  return (
    <NotificationProvider
      labels={{
        close: translate('common.closeNotification'),
        errorTitle: translate('common.errorTitle'),
        successTitle: translate('common.successTitle'),
      }}
    >
      <TooltipProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </TooltipProvider>
    </NotificationProvider>
  );
}

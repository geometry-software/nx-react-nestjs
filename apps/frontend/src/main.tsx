import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@nx-react-nestjs/components/ui/tooltip';
import App from './app/app';
import { I18nProvider } from './app/i18n';
import { store } from './app/store';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element was not found');

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <I18nProvider>
        <TooltipProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </Provider>
  </StrictMode>,
);

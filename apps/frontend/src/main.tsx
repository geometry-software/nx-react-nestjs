import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/app';
import { AppProvider } from './app/providers/app.provider';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element was not found');

createRoot(root).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);

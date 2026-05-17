import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AppShell } from './AppShell.js';

const ssrData = window.__GRAO_DATA__ ?? null;

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <AppShell ssrData={ssrData} />
  </BrowserRouter>,
);

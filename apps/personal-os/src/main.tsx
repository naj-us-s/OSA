import React from 'react';
import { createRoot } from 'react-dom/client';

import '@pos/ui-theme';
import { App } from './App.js';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

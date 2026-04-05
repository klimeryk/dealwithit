import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';

import './index.css';

declare global {
  interface Window {
    Jimp: typeof import('jimp');
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No root element? What is even true anymore?!');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeSwitcher>
      <App />
    </ThemeSwitcher>
  </React.StrictMode>,
);

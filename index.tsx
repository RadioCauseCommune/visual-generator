
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Expose html-to-image globalement pour compatibilité avec App.tsx
import * as htmlToImageLib from 'html-to-image';
(window as any).htmlToImage = htmlToImageLib;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

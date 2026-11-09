import React from 'react';
import { createRoot } from 'react-dom/client';
import { DemoGate } from './DemoGate.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DemoGate />
  </React.StrictMode>
);

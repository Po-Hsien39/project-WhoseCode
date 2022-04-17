import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StatusProvider } from './hook/useStatus';
// import MyEditor from './Editor';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <StatusProvider>
    <App />
  </StatusProvider>
);

reportWebVitals();

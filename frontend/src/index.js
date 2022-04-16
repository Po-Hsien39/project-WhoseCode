import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StatusProvider } from './hook/useStatus';
// import MyEditor from './Editor';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log(root);
root.render(
  // <React.StrictMode>
  // <div>123</div>
  <StatusProvider>
    <App />
  </StatusProvider>
  // </React.StrictMode>
);

reportWebVitals();

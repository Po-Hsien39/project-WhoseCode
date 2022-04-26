import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StatusProvider } from './hook/useStatus';
import { SnackbarProvider } from './hook/useSnackbar';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <StatusProvider>
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  </StatusProvider>
);

reportWebVitals();

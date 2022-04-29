import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StatusProvider } from './hook/useStatus';
import { SnackbarProvider } from './hook/useSnackbar';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <StatusProvider>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </StatusProvider>
  </Router>
);

reportWebVitals();

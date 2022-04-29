import './App.css';
import { useSnackbar } from './hook/useSnackbar';
import { Snackbar, Alert } from '@mui/material';
import Main from './containers/Main';
import { ThemeProvider } from '@mui/material/styles';
import theme from './utils/theme';
import Appbar from './components/Appbar';
import { useStatus } from './hook/useStatus';

function App() {
  const { snackbarOption, handleCloseSnackbar } = useSnackbar();
  const { user } = useStatus();

  return (
    <ThemeProvider theme={theme}>
      {user.login ? null : <Appbar />}
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={snackbarOption.open}
        autoHideDuration={snackbarOption.duration}
        onClose={handleCloseSnackbar}>
        <Alert
          // color="primary"
          // sx={{ color: "secondary" }}
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbarOption.severity}>
          {snackbarOption.message}
        </Alert>
      </Snackbar>
      <Main />
    </ThemeProvider>
  );
}

export default App;

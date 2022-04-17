import './App.css';
import Editor from './components/Editor/index';
import { useSnackbar } from './hook/useSnackbar';
import { Fragment } from 'react';
import { Snackbar, Alert } from '@mui/material';

function App() {
  const { snackbarOption, handleCloseSnackbar } = useSnackbar();
  return (
    <Fragment>
      <Editor />
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
    </Fragment>
  );
}

export default App;

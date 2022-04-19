import { createContext, useContext, useState } from 'react';

const SnackbarContext = createContext({
  showMessage: () => {},
});

const SnackbarProvider = ({ children }) => {
  const [snackbarOption, setSnackbarOption] = useState({
    open: false,
    message: 'I am a default message',
    severity: 'success',
    duration: 2000,
  });

  const showMessage = (message, severity = 'success', duration = 2000) => {
    setSnackbarOption({
      open: true,
      message,
      severity,
      duration,
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOption({
      ...snackbarOption,
      open: false,
    });
  };

  return (
    <>
      <SnackbarContext.Provider
        value={{
          snackbarOption,
          showMessage,
          handleCloseSnackbar,
        }}>
        {children}
      </SnackbarContext.Provider>
    </>
  );
};

const useSnackbar = () => {
  return useContext(SnackbarContext);
};

export { SnackbarProvider, useSnackbar };

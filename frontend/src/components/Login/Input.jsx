import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import React from 'react';

const Input = ({ name, handlechange, type, handleShowPassword, ...props }) => {
  return (
    <TextField
      name={name}
      onChange={handlechange}
      required
      fullWidth
      variant="outlined"
      margin="dense"
      type={type}
      color="secondary"
      InputProps={
        name === 'password' || name === 'confirmPassword'
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleShowPassword}
                    edge="end">
                    {type === 'password' ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }
          : null
      }
      {...props}
    />
  );
};

export default Input;

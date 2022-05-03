import {
  Button,
  Modal,
  Box,
  Typography,
  Divider,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { useStatus } from '../../hook/useStatus';
import { useEffect, useState } from 'react';
import BootstrapInput from '../../utilComponents/input';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function SpecificInvite({ open, setOpen }) {
  const [emailValue, setEmailValue] = useState('');
  const { request, note, setNote } = useStatus();
  const [selection, setSelection] = useState('view');

  const closeModal = () => {
    setOpen(false);
  };
  useEffect(() => {
    if (open) setEmailValue('');
  }, [open]);

  useEffect(() => {
    console.log(note);
  }, [note]);

  return (
    <Modal
      open={open}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography fontWeight={'bold'} variant="h5">
            Invite Guests!
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ marginTop: '20px', marginBottom: '15px' }}>
          <Typography sx={{ color: '#598DEB' }} fontWeight="bold">
            Invite your guests with Email addresses
          </Typography>
          <Box>
            <Grid
              container
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Grid item xs={12} md={9}>
                <TextField
                  style={{ width: '100%' }}
                  color="secondary"
                  value={emailValue}
                  onChange={(e) => {
                    setEmailValue(e.target.value);
                  }}
                  inputProps={{
                    style: {
                      fontSize: 15,
                      height: 5,
                      backgroundColor: '#F2F2F2',
                    },
                  }}></TextField>
              </Grid>
              <Grid item xs={12} md={0.5} />
              <Grid item xs={12} md={2.5}>
                <FormControl variant="standard">
                  <Select
                    labelId="demo-customized-select-label"
                    id="demo-customized-select"
                    value={selection}
                    onChange={(e) => {
                      setSelection(e.target.value);
                    }}
                    input={<BootstrapInput />}>
                    <MenuItem value={'edit'}>Can Edit</MenuItem>
                    <MenuItem value={'comment'}>Can Comment</MenuItem>
                    <MenuItem value={'view'}>Can View</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              width: '80px',
              marginRight: '15px',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'primary',
              },
            }}
            onClick={async () => {
              setOpen(false);
              await request.createNoteContributor(
                note.id,
                emailValue,
                selection
              );
              setEmailValue('');
              setNote((prev) => {
                return {
                  ...prev,
                  permission: {
                    ...note.permission,
                    allowOthers: [
                      ...note.permission.allowOthers,
                      { email: emailValue, permission: selection },
                    ],
                  },
                };
              });
            }}>
            Invite
          </Button>
          <Button
            variant="contained"
            color="tetiary"
            sx={{ width: '80px' }}
            onClick={async () => {
              setOpen(false);
            }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

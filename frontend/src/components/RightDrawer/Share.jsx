import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PublicIcon from '@mui/icons-material/Public';
import Invite from './Invite';
import { Switch, Divider, Box, Grid, Tooltip, TextField } from '@mui/material';
import { useStatus } from '../../hook/useStatus';
import { useState, useEffect } from 'react';
import { useSnackbar } from '../../hook/useSnackbar';

export default function BasicPopover() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { setNote, request, note } = useStatus();
  const { showMessage } = useSnackbar();

  const handleClick = async (event) => {
    if (!note.id) {
      showMessage('You have to select a note', 'error');
      return;
    }
    setAnchorEl(event.currentTarget);
    let res = await request.getPermission(note.id);
    setNote({ ...note, permission: res.data.permission });
    console.log(res.data);
    console.log(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <React.Fragment>
      <Tooltip title="Share With Others" placement="bottom">
        <Button sx={{ color: 'black' }} onClick={handleClick}>
          Share
        </Button>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}>
        <Box sx={{ width: '400px' }}>
          <Grid
            container
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              '&:hover': {
                cursor: 'pointer',
                backgroundColor: '#F2F2F2',
              },
            }}
            onClick={async () => {
              if (!note.permission.openToPublic) {
                //TODO: change the control from check to state
                setNote((prev) => {
                  return {
                    ...prev,
                    permission: {
                      openToPublic: true,
                      allowEdit: false,
                      allowComment: false,
                      allowDuplicate: true,
                      others: [],
                    },
                  };
                });
                await request.allowPublicPermission(note.id);
              } else {
                setNote((prev) => {
                  return {
                    ...prev,
                    permission: {
                      openToPublic: false,
                      allowEdit: false,
                      allowComment: false,
                      allowDuplicate: false,
                      others: [],
                    },
                  };
                });
                await request.denyPublicPermission(note.id);
              }
            }}>
            <Grid item xs={12} md={1.5}>
              <PublicIcon sx={{ fontSize: 30 }} />
            </Grid>
            <Grid
              item
              xs={12}
              md={8.5}
              sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h8" sx={{ color: '#8C99A9' }}>
                Share With Others
              </Typography>
              <Typography
                variant="h8"
                sx={{ color: 'gray', fontSize: 12, margin: 0 }}>
                Publish and share the link to everyone
              </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Switch
                checked={note.permission.openToPublic}
                color="secondary"
              />
            </Grid>
          </Grid>
          <Divider />
          <Invite />
          <Grid
            container
            sx={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
            <Grid item xs={12} md={0.25}></Grid>
            <Grid
              item
              xs={12}
              md={9.25}
              sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                style={{ width: '100%' }}
                placeholder="Invite Others with Emails"
                inputProps={{
                  style: {
                    fontSize: 10,
                    height: 5,
                    boxSizing: 'border-box',
                    width: '100%',
                    backgroundColor: '#F2F2F2',
                  },
                }}></TextField>
            </Grid>
            <Grid item xs={12} md={0.25}></Grid>
            <Grid item xs={12} md={1.75}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                sx={{
                  '&:hover': {
                    backgroundColor: '#EDF4F3',
                  },
                }}>
                Invite
              </Button>
            </Grid>
          </Grid>
          <Divider />
        </Box>
      </Popover>
    </React.Fragment>
  );
}

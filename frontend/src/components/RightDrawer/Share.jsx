import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PublicIcon from '@mui/icons-material/Public';
import Invite from './Invite';
import {
  Switch,
  Divider,
  Box,
  Grid,
  Tooltip,
  Avatar,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { useStatus } from '../../hook/useStatus';
import { useState } from 'react';
import { useSnackbar } from '../../hook/useSnackbar';
import SpecificInvite from './SpecificInvite';
import { useEffect } from 'react';
import BootstrapInput from '../../utilComponents/input';

export default function BasicPopover() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const { setNote, request, note, otherNotesPermission, user } = useStatus();
  const { showMessage } = useSnackbar();

  const handleClick = async (event) => {
    if (!note.id) {
      showMessage('You have to select a note', 'error');
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <React.Fragment>
      <SpecificInvite open={openInviteModal} setOpen={setOpenInviteModal} />
      {!otherNotesPermission.status ? (
        <>
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
                    setNote((prev) => {
                      return {
                        ...prev,
                        permission: {
                          ...prev.permission,
                          openToPublic: true,
                          allowEdit: false,
                          allowComment: false,
                          allowDuplicate: true,
                        },
                      };
                    });
                    await request.allowPublicPermission(note.id);
                  } else {
                    setNote((prev) => {
                      return {
                        ...prev,
                        permission: {
                          ...prev.permission,
                          openToPublic: false,
                          allowEdit: false,
                          allowComment: false,
                          allowDuplicate: false,
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
                  <Button
                    sx={{
                      width: '100%',
                      backgroundColor: '#F2F2F2',
                      color: 'gray',
                      textAlign: 'left',
                      '&:hover': {
                        backgroundColor: '#F2F2F2',
                      },
                    }}
                    onClick={() => {
                      if (
                        note.permission?.allowOthers &&
                        note.permission.allowOthers.length > 4
                      ) {
                        showMessage(
                          'You can not invite more than 5 people',
                          'error'
                        );
                        return;
                      }
                      setOpenInviteModal(true);
                    }}>
                    Invite Others with Emails
                  </Button>
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
                    }}
                    onClick={() => {
                      if (note.permission.allowOthers.length > 4) {
                        showMessage(
                          'You can not invite more than 5 people',
                          'error'
                        );
                        return;
                      }
                      setOpenInviteModal(true);
                    }}>
                    Invite
                  </Button>
                </Grid>
              </Grid>
              {note.permission.allowOthers?.length ? (
                <Box>
                  {note.permission?.allowOthers.map((item, index) => {
                    return <Person key={index} item={item} />;
                  })}
                  <Person
                    host={true}
                    item={{ email: user.name, permission: 'full' }}
                  />
                </Box>
              ) : null}
              {/* <Divider /> */}
            </Box>
          </Popover>
        </>
      ) : null}
    </React.Fragment>
  );
}

const Person = ({ item }) => {
  const { setNote, request, note } = useStatus();
  return (
    <>
      <Divider />
      <Grid
        container
        sx={{
          padding: '10px',
          cursor: 'pointer',
          display: 'flex',
          height: '60px',
          alignItems: 'center',
          '&:hover': {
            backgroundColor: '#F2F2F2',
          },
        }}>
        <Grid item xs={12} md={0.5} />
        <Grid item xs={12} md={1.5}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              border: '1px solid #000',
              backgroundColor: '#fff',
              color: '#000',
            }}>
            {item.email[0]}
          </Avatar>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography>{item.email}</Typography>
          {item.permission === 'full' ? (
            <Typography
              sx={{ fontSize: 12, fontWeight: 'bold' }}
              color="secondary.main">
              Host
            </Typography>
          ) : (
            <Typography
              sx={{ fontSize: 12, fontWeight: 'bold' }}
              color="#DAA650">
              Guest
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl sx={{ m: 1 }} variant="standard">
            <Select
              disabled={item.permission === 'full'}
              labelId="demo-customized-select-label"
              id="demo-customized-select"
              value={item.permission}
              onChange={async (e) => {
                if (e.target.value === 'remove') {
                  await request.deleteNoteContributor(note.id, item.email);
                  setNote((prev) => {
                    return {
                      ...prev,
                      permission: {
                        ...prev.permission,
                        allowOthers: prev.permission.allowOthers.filter(
                          (user) => user.email !== item.email
                        ),
                      },
                    };
                  });
                } else {
                  await request.updateNoteContributor(
                    note.id,
                    item.email,
                    e.target.value
                  );
                  setNote((prev) => {
                    let newPermissions = prev.permission.allowOthers;
                    newPermissions[newPermissions.indexOf(item)] = {
                      email: item.email,
                      permission: e.target.value,
                    };
                    return {
                      ...prev,
                      permission: {
                        ...prev.permission,
                        allowOthers: newPermissions,
                      },
                    };
                  });
                }
              }}
              input={<BootstrapInput />}>
              <MenuItem value={'full'} disabled>
                Full Access
              </MenuItem>
              <MenuItem value={'edit'}>Can Edit</MenuItem>
              <MenuItem value={'comment'}>Can Comment</MenuItem>
              <MenuItem value={'view'}>Can View</MenuItem>
              <MenuItem value={'remove'} sx={{ color: 'red' }}>
                Remove
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
};

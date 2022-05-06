import {
  Popover,
  Box,
  Typography,
  Grid,
  Divider,
  ButtonBase,
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useStatus } from '../../hook/useStatus';
import { useSnackbar } from '../../hook/useSnackbar';
import {
  Link as LinkIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  IosShare as IosShareIcon,
} from '@mui/icons-material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MessageIcon from '@mui/icons-material/Message';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import UndoIcon from '@mui/icons-material/Undo';
import { useEffect } from 'react';

export default function Setting({ open, setOpen, anchor, setAnchor }) {
  const { user } = useStatus();
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Popover
      open={open}
      anchorEl={anchor}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}>
      <Box sx={{ width: '250px', height: '380px' }}>
        <Box
          sx={{ marginBottom: '5px', padding: '15px', paddingBottom: '5px' }}>
          <Typography variant="h8" sx={{ color: '#7D7C78', fontSize: 12 }}>
            STYLE
          </Typography>
        </Box>
        <Grid container sx={{ marginBottom: '10px' }}>
          {['Default', 'Serif', 'Mono'].map((family) => {
            return <FontDemo key={family} family={family} />;
          })}
        </Grid>
        <Divider />

        {[
          'Copy Link',
          'Check Comments',
          'View Version',
          'Export',
          'Logout',
        ].map((option) => {
          return (
            <SettingOption key={option} option={option} setOpen={setOpen} />
          );
        })}
        <Divider />
        <Box sx={{ padding: '10px 15px' }}>
          <Typography variant="h8" sx={{ color: '#7D7C78', fontSize: 12 }}>
            Created at: 2020-01-01
          </Typography>
          <br />
          <Typography variant="h8" sx={{ color: '#7D7C78', fontSize: 12 }}>
            Last Update: 2020-01-01
          </Typography>
          <br />
          <Typography variant="h8" sx={{ color: '#7D7C78', fontSize: 12 }}>
            Owner: {user.name}
          </Typography>
        </Box>
      </Box>
    </Popover>
  );
}

const SettingOption = ({ option, setOpen }) => {
  const { showMessage } = useSnackbar();
  const { note, functionControl } = useStatus();

  const showIcon = (option) => {
    if (option === 'Copy Link') {
      return <LinkIcon sx={{ fontSize: 18 }} />;
    } else if (option === 'Modify Permission') {
      return <LockOpenIcon sx={{ fontSize: 18 }} />;
    } else if (option === 'Check Comments') {
      return <MessageIcon sx={{ fontSize: 18 }} />;
    } else if (option === 'View Version') {
      return <AccessAlarmsIcon sx={{ fontSize: 18 }} />;
    } else if (option === 'Delete') {
      return <DeleteIcon sx={{ fontSize: 18 }} />;
    } else if (option === 'Export') {
      return <IosShareIcon sx={{ fontSize: 18 }} />;
    } else if (option === 'Show Deleted Pages') {
      return <UndoIcon sx={{ fontSize: 18 }} />;
    } else if (option === 'Logout') {
      return <LogoutIcon sx={{ fontSize: 18 }} />;
    }
  };

  const handleEvent = () => {
    if (option === 'Add to Favorites') {
      console.log('Add to Favorites');
      functionControl.editFavorite();
    } else if (option === 'Copy Link') {
      showMessage('Link copied to clipboard');
      navigator.clipboard.writeText(
        `${import.meta.env.VITE_APP_DOMAIN}/notes/${note.url}`
      );
    } else if (option === 'Check Comments') {
      functionControl.showComment();
      setOpen(false);
    } else if (option === 'View Version') {
      functionControl.showVersion();
      setOpen(false);
    } else if (option === 'Export') {
      functionControl.export(true);
    } else if (option === 'Logout') {
      functionControl.logout();
    }
  };

  return (
    <ButtonBase
      sx={{
        width: '100%',
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: '#F5F5F5',
        },
      }}
      onClick={() => {
        handleEvent();
      }}>
      <Grid
        container
        className="12345"
        sx={{
          padding: '6px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}>
        <Grid item xs={2}>
          {showIcon(option)}
        </Grid>
        <Grid item xs={10} sx={{ textAlign: 'left' }}>
          <Typography
            variant="h8"
            sx={{
              color: option === 'Logout' ? 'red' : '#7D7C78',
              fontSize: 13,
            }}>
            {option}
          </Typography>
        </Grid>
      </Grid>
    </ButtonBase>
  );
};

const FontDemo = ({ family }) => {
  const { noteFont, setNoteFont } = useStatus();
  return (
    <Grid item xs={4}>
      <ButtonBase
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '10px',
          borderRadius: '5px',
          '&:hover': {
            cursor: 'pointer',
            backgroundColor: '#F5F5F5',
          },
        }}
        onClick={() => {
          setNoteFont(family);
        }}>
        <Typography
          variant="h8"
          sx={{
            fontSize: 30,
            lineHeight: '25px',
            fontFamily: family === 'Mono' ? 'monospace' : family,
            color: noteFont === family ? '#2CAADC' : '#7D7C78',
          }}>
          Tt
        </Typography>
        <Typography sx={{ fontSize: 12 }}>{family}</Typography>
      </ButtonBase>
    </Grid>
  );
};

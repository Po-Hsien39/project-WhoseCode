import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Tooltip, Box, Drawer } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Editor from './Editor';
import { ButtonBase, Avatar, Button } from '@mui/material';
import { useStatus } from '../hook/useStatus';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import ArticleIcon from '@mui/icons-material/Article';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from '@mui/icons-material/Add';
const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft() {
  const { user } = useStatus();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const iconPicker = (text) => {
    if (text === 'Quick Find') {
      return <SearchIcon />;
    } else if (text === 'All Updates') {
      return <AccessAlarmIcon />;
    } else if (text === 'Setting & Members') {
      return <SettingsIcon />;
    } else {
      return <SettingsIcon />;
    }
  };
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            WhoseCode
          </Typography>
          <Box
            sx={{
              marginLeft: 'auto',
            }}>
            <Tooltip title="Share With Others" placement="bottom">
              <Button sx={{ color: 'black' }}>Share</Button>
            </Tooltip>
            {/* <Tooltip title="Create Notes" placement="bottom">
              <IconButton>
                <AddIcon />
              </IconButton>
            </Tooltip> */}
            <Tooltip title="View Version" placement="bottom">
              <IconButton>
                <AccessAlarmIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add to Collection" placement="bottom">
              <IconButton>
                <StarBorderIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Other Settings" placement="bottom">
              <IconButton>
                <MoreHorizIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}>
        <DrawerHeader sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <ButtonBase>
            <Avatar
              size="small"
              variant="square"
              sx={{ width: 30, height: 30 }}
              src={user.login ? `//joeschmoe.io/api/v1/${user.name}` : ''}
            />
            <Typography
              variant="h6"
              noWrap
              sx={{ marginLeft: '10px', width: '150px', textAlign: 'left' }}>
              {user.name + "'s Notes"}
            </Typography>
          </ButtonBase>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {['Quick Find', 'All Updates', 'Setting & Members'].map(
            (text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>{iconPicker(text)}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            )
          )}
        </List>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h10"
            fontSize={12}
            sx={{ marginLeft: '17px', color: 'gray' }}
            noWrap>
            FAVORITES
          </Typography>
          <IconButton
            size="small"
            fontSize="small"
            sx={{ marginLeft: '100px' }}>
            <AddIcon />
          </IconButton>
        </Box>
        <List>
          {['How to be a Engineer?'].map((text, index) => (
            <ListItem button key={text}>
              <ArticleIcon
                fontSize="small"
                size="small"
                sx={{ marginRight: '5px' }}
              />
              <ListItemText primary={text} sx={{ fontSize: '15px' }} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h10"
            fontSize={12}
            sx={{ marginLeft: '17px', color: 'gray' }}
            noWrap>
            PRIVATE
          </Typography>
          <IconButton
            size="small"
            fontSize="small"
            sx={{ marginLeft: '120px' }}>
            <AddIcon />
          </IconButton>
        </Box>
        <List>
          {['Trash'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Editor />
      </Main>
    </Box>
  );
}

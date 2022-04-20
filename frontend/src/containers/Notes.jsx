import { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Tooltip,
  Toolbar,
  Box,
  Drawer,
  CssBaseline,
  AppBar as MuiAppBar,
  List,
  Typography,
  Divider,
  IconButton,
  ButtonBase,
  Avatar,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccessAlarm as AccessAlarmIcon,
  StarBorder as StarBorderIcon,
  MoreHoriz as MoreHorizIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Editor from './Editor';
import { useStatus } from '../hook/useStatus';
import MyList from '../components/Notes/List';
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
  const { user, request, setNote, notes, setNotes } = useStatus();
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  useEffect(() => {
    console.log('notes', notes);
  }, [notes]);

  useEffect(() => {
    if (user.id) {
      const fetchNotes = async () => {
        const res = await request.getAllNotes(user.id);
        setNotes(res.data.notes);
      };
      fetchNotes();
    }
  }, [user]);

  useEffect(() => {
    console.log('notes', notes);
  }, [notes]);

  const createNote = async () => {
    let note = await request.createNote();
    setNote({ ...note, id: note.data.noteId });
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
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
          {['Home', 'Quick Find', 'All Updates', 'Setting'].map((text) => (
            <MyList title={text} key={text} />
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
            sx={{ marginLeft: '120px' }}
            onClick={createNote}>
            <AddIcon />
          </IconButton>
        </Box>
        {notes.map((note, i) => {
          return (
            <MyList title={note.title} type={'note'} id={note.id} key={i} />
          );
        })}
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '15px' }}>
          <Typography
            variant="h10"
            fontSize={12}
            sx={{ marginLeft: '17px', color: 'gray' }}
            noWrap>
            OTHERS
          </Typography>
        </Box>
        <List>
          {['Trash', 'Export'].map((text) => (
            <MyList title={text} key={text} />
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

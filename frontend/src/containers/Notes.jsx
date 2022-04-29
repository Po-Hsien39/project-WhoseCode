import { useState, useEffect, Fragment } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tooltip,
  Toolbar,
  Box,
  Drawer,
  CssBaseline,
  List,
  Typography,
  Divider,
  IconButton,
  ButtonBase,
  Avatar,
  Stack,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccessAlarm as AccessAlarmIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  MoreHoriz as MoreHorizIcon,
  Add as AddIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import Editor from './Editor';
import { useStatus } from '../hook/useStatus';
import MyList from '../components/Notes/List';
import DrawerContent from '../components/RightDrawer';
import DrawerAppbar from '../components/DrawerAppbar';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PopoverPopupState from '../components/RightDrawer/Share';
import Create from '../components/Notes/Create';
import Error from '../components/Notes/Error';
const drawerWidth = 240;
const drawerRight = 400;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, rightopen }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    marginRight: `-${drawerRight}px`,
    ...(rightopen && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    }),
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft() {
  const {
    user,
    request,
    setNote,
    notes,
    setNotes,
    note,
    diffVersion,
    versionNote,
    setVersionNote,
    setDefaultCreate,
    otherNotesPermission,
  } = useStatus();
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [rightopen, setRightopen] = useState(false);
  const [rightDrawerType, setRightDrawerType] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const { id: currentUrl } = useParams();
  const [createPage, setCreatePage] = useState({ page: 1, type: 'next' });

  // Get User Notes
  useEffect(() => {
    if (user.id) {
      console.log(user);
      const fetchNotes = async () => {
        const res = await request.getAllNotes(user.id);
        console.log(res.data.notes);
        res.data.notes = res.data.notes.sort(
          (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
        );
        console.log(res.data.notes);
        let currentNotes = res.data.notes.reduce((acc, note) => {
          if (note.deleted) {
            acc['delete'] ? acc['delete'].push(note) : (acc['delete'] = [note]);
          } else if (note.star) {
            acc['collect']
              ? acc['collect'].push(note)
              : (acc['collect'] = [note]);
          } else {
            acc['private']
              ? acc['private'].push(note)
              : (acc['private'] = [note]);
          }
          return acc;
        }, {});
        console.log('currentNotes', currentNotes);
        setNotes(currentNotes);
      };
      fetchNotes();
    }
  }, [user]);
  useEffect(() => {
    const getNote = async () => {
      if (currentUrl) {
        // No note selected
        if (currentUrl === 'all') {
          setVersionNote({ id: '', version: '', content: '' });
          setNote({ ...note, star: false, id: null, url: null });
        } else {
          console.log('currentUrl', currentUrl);
          // let res = await request.getNote(currentUrl);
          setNote((prev) => {
            return { ...prev, url: currentUrl };
          });
          // console.log(res);
        }
      }
    };
    getNote();
  }, [currentUrl]);
  const createNote = async () => {
    setCreatePage({ page: 1, type: 'next' });
    setCreateModal(true);
    setDefaultCreate();
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const editFavorite = async () => {
    console.log(note);
    await request.addStarToNote(note.id, !note.star);
    setNote((prev) => ({ ...prev, star: !prev.star }));
    setNotes((notes) => {
      let newNotes = { ...notes };
      let targetNote;
      console.log(note);
      if (note.star) {
        newNotes.collect = newNotes.collect.filter((item) => {
          if (item.id === note.id) targetNote = item;
          return item.id !== note.id;
        });
        if (newNotes.private) newNotes.private.unshift(targetNote);
        else newNotes.private = [targetNote];
      } else {
        newNotes.private = newNotes.private.filter((item) => {
          if (item.id === note.id) targetNote = item;
          return item.id !== note.id;
        });
        if (newNotes.collect) newNotes.collect.unshift(targetNote);
        else newNotes.collect = [targetNote];
      }
      console.log(newNotes);
      return newNotes;
    });
  };
  return (
    <Box sx={{ display: 'flex' }}>
      <Create
        open={createModal}
        setOpen={setCreateModal}
        page={createPage}
        setPage={setCreatePage}
      />
      <Box
        sx={{
          marginLeft: 'auto',
          position: 'fixed',
          right: 0,
          top: '10px',
          zIndex: 110,
        }}>
        <PopoverPopupState />
        <Tooltip title="View Comments" placement="bottom">
          <IconButton
            onClick={() => {
              if (rightDrawerType === 'comment') setRightopen((prev) => !prev);
              else setRightopen(true);
              setRightDrawerType('comment');
            }}>
            <CommentIcon />
          </IconButton>
        </Tooltip>
        {!otherNotesPermission.status ? (
          <Tooltip title="View Version" placement="bottom">
            <IconButton
              onClick={() => {
                console.log(rightDrawerType);
                if (rightDrawerType === 'version')
                  setRightopen((prev) => !prev);
                else setRightopen(true);
                setRightDrawerType('version');
              }}>
              <AccessAlarmIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        <Tooltip
          title={
            !otherNotesPermission.status
              ? 'Add to Collection'
              : 'Send star to the author'
          }
          placement="bottom">
          <IconButton onClick={() => editFavorite()}>
            {!note.star ? (
              <StarBorderIcon />
            ) : (
              <StarIcon sx={{ color: '#F6C050' }} />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Other Settings" placement="bottom">
          <IconButton>
            <MoreHorizIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <CssBaseline />
      <DrawerAppbar
        position="fixed"
        open={open}
        rightopen={rightopen ? 1 : 0}
        sx={{ zIndex: 105 }}>
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
          {note.id && (
            <Stack direction="row" spacing={1} sx={{ marginLeft: '20px' }}>
              {note.star ? (
                <Chip label="Collected" sx={{ backgroundColor: '#F2D399' }} />
              ) : null}
              <Chip
                label={
                  versionNote.id ? `Version ${versionNote.version}` : `Latest`
                }
                sx={{ backgroundColor: '#C2C9F2' }}
              />
              {versionNote.version ||
              (otherNotesPermission.status &&
                !otherNotesPermission.permission.allowEdit) ? (
                <Chip label="Read Only" sx={{ backgroundColor: '#B9D4E1' }} />
              ) : null}
              {diffVersion.compare ? (
                <Chip label="Show Diff" sx={{ backgroundColor: '#F5FDFF' }} />
              ) : null}
            </Stack>
          )}
        </Toolbar>
      </DrawerAppbar>
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
            <MyList title={text} key={text} setRightopen={setRightopen} />
          ))}
        </List>
        {notes.collect?.length ? (
          <Fragment>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h10"
                fontSize={12}
                sx={{ marginLeft: '17px', color: 'gray' }}
                noWrap>
                FAVORITE
              </Typography>
              <IconButton
                size="small"
                fontSize="small"
                sx={{ marginLeft: '120px' }}
                onClick={createNote}>
                <AddIcon />
              </IconButton>
            </Box>
            {notes.collect.map((note, i) => {
              return (
                <MyList
                  title={note.title}
                  url={note.url}
                  type={'note'}
                  id={note.id}
                  star={true}
                  key={i}
                />
              );
            })}
          </Fragment>
        ) : null}

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
        {notes.private
          ? notes.private.map((note, i) => {
              return (
                <MyList
                  title={note.title}
                  url={note.url}
                  type={'note'}
                  id={note.id}
                  key={i}
                />
              );
            })
          : null}
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
      <Main open={open} rightopen={rightopen ? 1 : 0}>
        <DrawerHeader />
        {otherNotesPermission.blocked ? <Error /> : <Editor />}
      </Main>
      <Drawer
        sx={{
          zIndex: '10',
          width: drawerRight,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerRight,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="right"
        open={rightopen}>
        <DrawerHeader
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            zIndex: '120',
            position: 'fixed',
          }}>
          <IconButton
            sx={{ position: 'fixed', zIndex: 101 }}
            onClick={() => {
              setRightopen(false);
            }}>
            <ArrowForwardIosIcon fontSize="small" size="small" />
          </IconButton>
        </DrawerHeader>
        <DrawerContent rightDrawerType={rightDrawerType} />
      </Drawer>
    </Box>
  );
}

import {
  Typography,
  Box,
  ButtonBase,
  Modal,
  Divider,
  Button,
} from '@mui/material';
import {
  Article as ArticleIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  AccessAlarm as AccessAlarmIcon,
  Delete as DeleteIcon,
  IosShare as IosShareIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useStatus } from '../../hook/useStatus';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../hook/useSnackbar';
import Trash from './Trash';

const List = ({ type, title, id, star, setRightopen, url }) => {
  const [onHover, setOnHover] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    setNote,
    note,
    notes,
    setNotes,
    setVersionNote,
    setDiffVersion,
    diffVersion,
    otherNotesPermission,
    setDefaultOtherPermission,
    request,
  } = useStatus();
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();

  const iconPicker = (text) => {
    if (text === 'Home') {
      return <HomeIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />;
    } else if (text === 'Quick Find') {
      return <SearchIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />;
    } else if (text === 'All Updates') {
      return (
        <AccessAlarmIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />
      );
    } else if (text === 'Setting') {
      return <SettingsIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />;
    } else if (text === 'Trash') {
      return <DeleteIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />;
    } else if (text === 'Export') {
      return <IosShareIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />;
    } else {
      return null;
    }
  };

  const handleClick = (event) => {
    console.log(setRightopen);
    if (setRightopen) setRightopen(false);
    if (diffVersion.compare) {
      setDiffVersion({
        compare: false,
        diff: null,
        latest: null,
        showCurrent: false,
      });
    }
    if (type === 'note') {
      setVersionNote({ id: '', version: '', content: '' });
      setNote({ ...note, id, star, url });
      navigate(`/notes/${url}`);
    } else if (title === 'Home') {
      if (otherNotesPermission.status) setDefaultOtherPermission();
      navigate('/notes/all');
    } else if (title === 'Trash') {
      setAnchorEl(event.currentTarget);
    } else {
      console.log('Function not support');
    }
  };

  const handleDelete = () => {
    setOpen(true);
  };
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
  return (
    <>
      <Trash anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography fontWeight={'bold'} variant="h5">
              Delete Note
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ marginTop: '20px', marginBottom: '15px' }}>
            <Typography sx={{ color: '#E63832' }} fontWeight="bold">
              Warning: You are going to move this note to the trash
            </Typography>
            <Typography variant="h8">
              All notes in the trash will be permanently deleted after a week.
              <br />
              Are you sure you wanna delete?
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="tetiary"
              sx={{ marginRight: '15px', width: '80px' }}
              onClick={async () => {
                setOpen(false);
                await request.deleteNote(id);
                if (star) {
                  setNotes((notes) => {
                    return handleRemove(notes, 'collect', id);
                  });
                } else {
                  setNotes((notes) => {
                    return handleRemove(notes, 'private', id);
                  });
                }
                if (note.id === id) {
                  setNote({
                    id: null,
                    star: false,
                    url: '',
                    permission: {
                      openToPublic: false,
                      allowEdit: false,
                      allowComment: false,
                      allowDuplicate: false,
                      allowOthers: [],
                    },
                  });
                  showMessage('Remove Successfully');
                  navigate('/notes/all');
                }
              }}>
              Sure
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                width: '80px',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'primary',
                },
              }}
              onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      <ButtonBase sx={{ width: '100%' }} onClick={handleClick}>
        <Box
          onMouseEnter={() => setOnHover(true)}
          onMouseLeave={() => setOnHover(false)}
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            background:
              (type === 'note' && note.id === id) ||
              (title === 'Trash' && anchorEl)
                ? 'rgba(0, 0, 0, 0.08)'
                : 'white',
            alignItems: 'center',
            padding: '10px 0',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.08)',
            },
          }}>
          {iconPicker(title) || (
            <ArticleIcon
              size="small"
              fontSize="small"
              sx={{ marginLeft: '15px', marginRight: '10px' }}
            />
          )}
          <Typography
            sx={{
              textAlign: 'left',
              textOverflow: 'ellipsis',
              width: onHover && type === 'note' ? '150px' : '180px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}>
            {title || 'Untitled'}
          </Typography>
          {onHover && type === 'note' ? (
            <DeleteIcon
              size="small"
              fontSize="small"
              color="inherit"
              onClick={() => {
                handleDelete();
              }}
              sx={{
                '&:hover': {
                  color: '#d12317',
                },
              }}
            />
          ) : null}
        </Box>
      </ButtonBase>
    </>
  );
};

const handleRemove = (notes, type, id) => {
  let deleteNote;
  let targetType;
  if (type === 'collect') targetType = notes.collect;
  else if (type === 'private') targetType = notes.private;

  let deletedNotes = notes.delete;
  targetType = targetType.filter((note) => {
    if (note.id !== id) return note;
    else deleteNote = note;
  });
  return {
    ...notes,
    [type]: targetType,
    delete: deletedNotes ? [...deletedNotes, deleteNote] : [deleteNote],
  };
};

export default List;

import {
  Modal,
  Box,
  Typography,
  Divider,
  Button,
  Slide,
  Fade,
  TextField,
  Grid,
  Switch,
  Collapse,
} from '@mui/material';
import { useState, useEffect, Fragment } from 'react';
import { useStatus } from '../../hook/useStatus';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../hook/useSnackbar';
import PublicIcon from '@mui/icons-material/Public';
import CreateIcon from '@mui/icons-material/Create';
const Create = ({ open, setOpen, page, setPage }) => {
  const [slideIn, setSlideIn] = useState(false);
  const [slideDirection, setSlideDirection] = useState('left');
  const [createContent, setCreateContent] = useState(null);

  useEffect(() => {
    console.log(page);
    if (page.page === 1 && page.type === 'next') {
      setCreateContent(<Page1 setPage={setPage} />);
      setSlideDirection('left');
      setSlideIn(true);
    } else {
      // setSlideDirection('right');
      setSlideDirection(page.type === 'next' ? 'right' : 'left');
      setSlideIn(false);
      setTimeout(() => {
        if (page.page === 1) setCreateContent(<Page1 setPage={setPage} />);
        else if (page.page === 2) setCreateContent(<Page2 setPage={setPage} />);
        else if (page.page === 3)
          setCreateContent(<Page3 setPage={setPage} setOpen={setOpen} />);
        setSlideDirection(page.type === 'next' ? 'left' : 'right');
        setSlideIn(true);
      }, 300);
    }
  }, [page]);

  // const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

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
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style}>
        <Slide in={slideIn} direction={slideDirection}>
          <Box>
            <Fade in={slideIn}>
              <Box>{createContent}</Box>
            </Fade>
          </Box>
        </Slide>
      </Box>
    </Modal>
  );
};

export default Create;

const Page1 = ({ setPage }) => {
  return (
    <Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CreateIcon sx={{ marginRight: '10px' }} />
        <Typography fontWeight={'bold'} variant="h5">
          Create Note
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ marginTop: '20px', marginBottom: '15px' }}>
        <Typography sx={{ color: '#598DEB' }} fontWeight="bold">
          Remind: You are going to create your notes.
        </Typography>
        <Typography variant="h8">
          You can give some detailed settings for your notes.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          onClick={() => {
            setPage({ page: 2, type: 'next' });
          }}>
          Next
        </Button>
      </Box>
    </Fragment>
  );
};

const Page2 = ({ setPage }) => {
  const { showMessage } = useSnackbar();
  const { createNoteDetails, setCreateNoteDetails } = useStatus();
  useEffect(() => {
    console.log(createNoteDetails);
  }, [createNoteDetails]);
  return (
    <Fragment>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}>
        <CreateIcon sx={{ marginRight: '10px' }} />
        <Typography
          fontWeight={'bold'}
          variant="h5"
          sx={{ marginBottom: '3px' }}>
          Setting Your Note
        </Typography>
        <Box
          container
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto',
          }}>
          <Typography fontWeight={'bold'} fontSize={14} variant="h8">
            Favorite?
          </Typography>
          <Switch
            color="secondary"
            size="small"
            checked={createNoteDetails.star}
            onChange={() => {
              setCreateNoteDetails((prev) => {
                return {
                  ...prev,
                  star: !prev.star,
                };
              });
            }}></Switch>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ marginTop: '25px', marginBottom: '15px' }}>
        <Grid container sx={{ display: 'flex', alignItems: 'center' }}>
          <Grid item xs={12} md={2.5}>
            <Typography fontWeight={'bold'} variant="h8">
              Note name
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              style={{ width: '100%' }}
              color="secondary"
              value={createNoteDetails.title}
              onChange={(e) => {
                setCreateNoteDetails((prev) => {
                  return {
                    ...prev,
                    title: e.target.value,
                  };
                });
              }}
              inputProps={{
                style: {
                  fontSize: 20,
                  height: 5,
                  backgroundColor: '#F2F2F2',
                },
              }}></TextField>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="tetiary"
          sx={{ marginRight: '15px' }}
          onClick={() => {
            setPage({ page: 1, type: 'prev' });
          }}>
          Prev
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
          onClick={() => {
            console.log(createNoteDetails);
            if (!createNoteDetails.title.trim())
              return showMessage('Please enter a title for your note', 'error');
            setPage({ page: 3, type: 'next' });
          }}>
          Next
        </Button>
      </Box>
    </Fragment>
  );
};

const Page3 = ({ setPage, setOpen }) => {
  const {
    createNoteDetails,
    setCreateNoteDetails,
    request,
    notes,
    setNotes,
    setVersionNote,
    versionNote,
    setNote,
  } = useStatus();
  const navigate = useNavigate();

  const createNote = async () => {
    let note = await request.createNote({
      ...createNoteDetails,
      content: versionNote.id ? versionNote.content : null,
    });
    let { url, noteId, star, title, permission } = note.data;
    console.log(url, noteId, star, title);
    setNote({ ...note, id: note.data.noteId, star, title, permission });
    console.log(versionNote.content);
    setVersionNote({ id: '', version: '', content: '' });
    navigate(`/notes/${url}`);
    if (!star) {
      setNotes({
        ...notes,
        private: !notes.private
          ? [{ deleted: 0, id: noteId, star: 0, title, url }]
          : [{ deleted: 0, id: noteId, star: 0, title, url }, ...notes.private],
      });
    } else {
      setNotes({
        ...notes,
        collect: !notes.collect
          ? [{ deleted: 0, id: noteId, star: 1, title, url }]
          : [{ deleted: 0, id: noteId, star: 1, title, url }, ...notes.collect],
      });
    }
    setOpen(false);
  };

  return (
    <Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <PublicIcon sx={{ marginRight: '10px' }} />
        <Typography fontWeight={'bold'} variant="h5">
          Setting Permission
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ marginTop: '20px', marginBottom: '15px' }}>
        <Grid container sx={{ marginBottom: '5px' }}>
          <Grid item xs={12} md={0.5}></Grid>
          <Grid item xs={12} md={10} sx={{ display: 'flex' }}>
            <Typography variant="h6" fontWeight={'bold'}>
              Share To Web
            </Typography>
          </Grid>
          <Grid item xs={12} md={1}>
            <Switch
              color="secondary"
              checked={createNoteDetails.permission.openToPublic}
              onChange={(e) => {
                setCreateNoteDetails((prev) => {
                  return {
                    ...prev,
                    permission: {
                      ...prev.permission,
                      openToPublic: e.target.checked,
                    },
                  };
                });
              }}></Switch>
          </Grid>
        </Grid>
        <Collapse in={createNoteDetails.permission.openToPublic}>
          {[
            'Allow Editing',
            'Allow Comments',
            'Allow Duplicate as template',
          ].map((item, index) => {
            return <Permission title={item} key={index} />;
          })}
        </Collapse>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="tetiary"
          sx={{ marginRight: '15px' }}
          onClick={() => {
            setPage({ page: 2, type: 'prev' });
          }}>
          Prev
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
          onClick={createNote}>
          Create
        </Button>
      </Box>
    </Fragment>
  );
};

const Permission = ({ title }) => {
  const { createNoteDetails, setCreateNoteDetails } = useStatus();

  useEffect(() => {
    console.log(createNoteDetails);
  }, [createNoteDetails]);
  return (
    <Grid container>
      <Grid item xs={12} md={0.5}></Grid>
      <Grid item xs={12} md={10}>
        <Typography variant="h8" fontWeight={'bold'}>
          {title}
        </Typography>
      </Grid>
      <Grid item xs={12} md={1}>
        <Switch
          color="secondary"
          checked={
            title === 'Allow Editing'
              ? createNoteDetails.permission.allowEdit
              : title === 'Allow Comments'
              ? createNoteDetails.permission.allowComment
              : createNoteDetails.permission.allowDuplicate
          }
          onChange={() => {
            if (title === 'Allow Editing') {
              // set
              setCreateNoteDetails({
                ...createNoteDetails,
                permission: {
                  ...createNoteDetails.permission,
                  allowEdit: !createNoteDetails.permission.allowEdit,
                },
              });
            } else if (title === 'Allow Comments') {
              console.log('comment');
              setCreateNoteDetails({
                ...createNoteDetails,
                permission: {
                  ...createNoteDetails.permission,
                  allowComment: !createNoteDetails.permission.allowComment,
                },
              });
            } else {
              setCreateNoteDetails({
                ...createNoteDetails,
                permission: {
                  ...createNoteDetails.permission,
                  allowDuplicate: !createNoteDetails.permission.allowDuplicate,
                },
              });
            }
          }}></Switch>
      </Grid>
    </Grid>
  );
};

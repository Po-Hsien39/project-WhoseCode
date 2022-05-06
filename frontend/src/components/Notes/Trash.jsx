import {
  Box,
  Popover,
  Typography,
  Divider,
  IconButton,
  Card,
  Tooltip,
  Modal,
  Button,
} from '@mui/material';
import { useStatus } from '../../hook/useStatus';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../hook/useSnackbar';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

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

export default function Trash({ anchorEl, setAnchorEl }) {
  const { notes, setNotes, request } = useStatus();
  const navigate = useNavigate();
  const [currentNote, setCurrentNote] = useState(null);
  const { showMessage } = useSnackbar();
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const [openModal, setOpenModal] = useState(false);
  const closeModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Modal
        open={openModal}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography fontWeight={'bold'} variant="h5">
              Permanently remove note
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ marginTop: '20px', marginBottom: '15px' }}>
            <Typography sx={{ color: '#E63832' }} fontWeight="bold">
              Warning: You are going to delete this note permanently
            </Typography>
            <Typography variant="h8">
              Once you click the sure below, you can't find your note back
              anymore.
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
                setOpenModal(false);
                await request.deleteNote(currentNote, true);
                setNotes((notes) => {
                  let deleteNotes = notes.delete;
                  deleteNotes = deleteNotes.filter(
                    (note) => note.id !== currentNote
                  );
                  return { ...notes, delete: deleteNotes };
                });
                showMessage('Note permanently deleted', 'success');
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
              onClick={() => {
                setOpenModal(false);
              }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}>
        <Box sx={{ width: '350px', height: '350px', padding: '15px' }}>
          <Typography variant="h5">Trash</Typography>
          <Divider />
          {notes.delete?.length ? (
            notes?.delete.map((note) => {
              return (
                <Card
                  key={note.title}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    margin: '10px 0',
                    width: '100%',
                    padding: '3px 5px',
                  }}>
                  <Typography variant="body2">{note.title}</Typography>
                  <Box>
                    <Tooltip title="Restore" placement="bottom">
                      <IconButton
                        onClick={async () => {
                          setNotes((notes) => {
                            let target;
                            const newNotes = notes.delete.filter(
                              (currentNote) => {
                                if (currentNote.id !== note.id)
                                  return currentNote;
                                else target = currentNote;
                              }
                            );
                            return {
                              ...notes,
                              delete: newNotes,
                              private: notes.private
                                ? [target, ...notes.private]
                                : [target],
                            };
                          });
                          await request.restoreNote(note.id);
                          navigate(`/notes/${note.url}`);
                          setAnchorEl(null);
                        }}>
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Permanently Removed" placement="bottom">
                      <IconButton
                        onClick={() => {
                          setCurrentNote(note.id);
                          setOpenModal(true);
                        }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              );
            })
          ) : (
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transform: 'translateY(-5%)',
              }}>
              <FolderOpenIcon sx={{ fontSize: 50 }} />
              <Typography
                variant="h7"
                fontWeight={'bold'}
                sx={{ marginTop: '15px' }}>
                Nothing in trash
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}

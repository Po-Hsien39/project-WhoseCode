import { Fragment, useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  Box,
  Divider,
  Avatar,
  ButtonBase,
  Chip,
  Stack,
  Button,
  Modal,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useStatus } from '../../hook/useStatus';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import DifferenceIcon from '@mui/icons-material/Difference';
import ForkLeftIcon from '@mui/icons-material/ForkLeft';
import ModalContent from './ModalContent';

const Version = () => {
  const {
    request,
    note,
    setVersionNote,
    versionNote,
    setDiffVersion,
    diffVersion,
  } = useStatus();
  const [versions, setVersions] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    const getVersions = async () => {
      if (!note || !note.id) return;
      const response = await request.getVersions(note.id);
      setVersions(response.data.diff);
    };
    getVersions();
  }, [note]);
  useEffect(() => {
    console.log(modalType);
  }, [modalType]);
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
    <Fragment>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <ModalContent
            type={modalType}
            setOpen={setOpen}
            setVersions={setVersions}
          />
        </Box>
      </Modal>

      {versions.length ? (
        <Box>
          <Box sx={{ width: '100%', padding: '15px' }}>
            <Typography variant="h8">Versions</Typography>
          </Box>
          <Divider />
          {versions.map((version, i) => {
            return (
              <Fragment key={i}>
                <ButtonBase
                  sx={{
                    width: '100%',
                    borderBottom:
                      versionNote.version === i + 1
                        ? '2px solid #E0E0E0'
                        : '1px solid #E0E0E0',
                    background:
                      versionNote.version === i + 1 ? '#EBEBEB' : 'white',
                  }}
                  onClick={async () => {
                    if (diffVersion.compare) {
                      setDiffVersion({
                        compare: false,
                        diff: null,
                        latest: null,
                        showCurrent: false,
                      });
                    }
                    if (versionNote.version !== i + 1) {
                      let res = await request.getVersion(note.id, i + 1);
                      setVersionNote({
                        content: res.data.version,
                        id: note.id,
                        version: i + 1,
                      });
                    }
                  }}>
                  <Grid
                    container
                    sx={{
                      padding: '15px',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                    <Grid item xs={12} md={2}>
                      <Avatar
                        sx={{ border: '1px solid #E0E0E0' }}
                        src={`//joeschmoe.io/api/v1/${
                          version.name || 'Tristan'
                        }`}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                      }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}>
                        <Typography variant="h8">
                          {'Tristan Edited Untitled'}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="h8"
                        sx={{ color: 'gray', marginTop: '5px' }}>
                        {version.date}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Chip label={`version ${i + 1}`} color="primary" />
                    </Grid>
                  </Grid>
                </ButtonBase>
                {versionNote.version === i + 1 ? (
                  <Grid
                    container
                    sx={{
                      borderBottom: '1px solid #E0E0E0',
                      background: '#EBEBEB',
                      padding: '10px',
                    }}>
                    {/* <Grid item xs={12} md={1.75}></Grid> */}
                    <Grid
                      item
                      xs={12}
                      md={5}
                      sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="tetiary"
                        onClick={() => {
                          if (diffVersion.compare) {
                            setDiffVersion({
                              compare: false,
                              diff: null,
                              latest: null,
                              showCurrent: false,
                            });
                          }
                          setModalType('rollback');
                          setOpen(true);
                        }}>
                        <SettingsBackupRestoreIcon />
                        Roll Back
                      </Button>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={3.5}
                      sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="tetiary"
                        onClick={() => {
                          setModalType('diff');
                          setOpen(true);
                        }}>
                        <DifferenceIcon />
                        Diff
                      </Button>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={3.5}
                      sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="tetiary"
                        onClick={() => {
                          setModalType('fork');
                          setOpen(true);
                          if (diffVersion.compare) {
                            setDiffVersion({
                              compare: false,
                              diff: null,
                              latest: null,
                              showCurrent: false,
                            });
                          }
                        }}>
                        <ForkLeftIcon sx={{ marginRight: '.5px' }} />
                        Fork
                      </Button>
                    </Grid>
                  </Grid>
                ) : null}
              </Fragment>
            );
          })}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <AccessTimeIcon size="large" fontSize="large" />
          <Typography variant="h6" sx={{ marginTop: '15px' }}>
            No any version yet
          </Typography>
          <Typography
            variant="h9"
            sx={{ marginTop: '15px', color: 'gray', textAlign: 'center' }}>
            We will keep track of your notes <br />
            when you update your note!
          </Typography>
        </Box>
      )}
    </Fragment>
  );
};

export default Version;

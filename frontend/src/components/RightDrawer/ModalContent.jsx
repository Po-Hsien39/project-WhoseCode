import { useState, useEffect, Fragment } from 'react';
import { Typography, Divider, Box, Button } from '@mui/material';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import DifferenceIcon from '@mui/icons-material/Difference';
import ForkLeftIcon from '@mui/icons-material/ForkLeft';
import { useStatus } from '../../hook/useStatus';
import { useSnackbar } from '../../hook/useSnackbar';
import compareVersion from '../../utils/diff';
const ModalContent = ({ type, setOpen, setVersions }) => {
  const [component, setComponent] = useState(null);
  useEffect(() => {
    if (!type) return;
    if (type === 'rollback') {
      setComponent(
        <RollBackModal setOpen={setOpen} setVersions={setVersions} />
      );
    } else if (type === 'diff') {
      setComponent(<DiffModal setOpen={setOpen} />);
    } else if (type === 'fork') {
      setComponent(<ForkModal setOpen={setOpen} />);
    }
  }, [type]);

  return <Fragment>{component}</Fragment>;
};

const RollBackModal = ({ setOpen, setVersions }) => {
  const { request, note, versionNote } = useStatus();
  const { showMessage } = useSnackbar();
  const rollbackversion = async () => {
    setOpen(false);
    await request.rollBackNote(
      note.id,
      versionNote.version,
      versionNote.content
    );
    setVersions((versions) => versions.slice(0, versionNote.version));
    showMessage('Rollback success');
  };

  return (
    <Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <SettingsBackupRestoreIcon sx={{ marginRight: '10px' }} />
        <Typography fontWeight={'bold'} variant="h5">
          Roll back
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ marginTop: '20px', marginBottom: '15px' }}>
        <Typography sx={{ color: '#E63832' }} fontWeight="bold">
          Warning: You are about to roll back to the previous version.
        </Typography>
        <Typography variant="h8">
          All versions after current will be discarded and can't be found.{' '}
          <br />
          Are you sure you wanna roll back?
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
          onClick={rollbackversion}>
          Sure
        </Button>
        <Button
          variant="contained"
          color="tetiary"
          sx={{ marginLeft: '15px', width: '80px' }}
          onClick={() => {
            setOpen(false);
          }}>
          Cancel
        </Button>
      </Box>
    </Fragment>
  );
};

const DiffModal = ({ setOpen }) => {
  const { editorState, versionNote, setDiffVersion } = useStatus();

  const showDiff = (showCurrent) => {
    setOpen(false);
    let { demoComprison, latestVersion } = compareVersion(
      versionNote.content,
      editorState
    );
    setDiffVersion({
      compare: true,
      diff: demoComprison,
      latest: latestVersion,
      showCurrent,
    });
  };

  return (
    <Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <DifferenceIcon sx={{ marginRight: '10px' }} />
        <Typography fontWeight={'bold'} variant="h5">
          Show diff
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ marginTop: '20px', marginBottom: '15px' }}>
        <Typography sx={{ color: '#598DEB' }} fontWeight="bold">
          Remind: You are going to see the difference between two versions.
        </Typography>
        <Typography variant="h8">
          Would you like to see only the difference between previous and latest
          version or also see current version?
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            width: '150px',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'primary',
            },
          }}
          onClick={() => showDiff(false)}>
          Diff Only
        </Button>
        <Button
          variant="contained"
          color="tetiary"
          sx={{
            marginLeft: '15px',
            width: '150px',
          }}
          onClick={() => showDiff(true)}>
          Show Both
        </Button>
      </Box>
    </Fragment>
  );
};

const ForkModal = ({ setOpen }) => {
  return (
    <Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ForkLeftIcon sx={{ marginRight: '10px' }} />
        <Typography fontWeight={'bold'} variant="h5">
          Save as new note
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ marginTop: '20px', marginBottom: '15px' }}>
        <Typography sx={{ color: '#598DEB' }} fontWeight="bold">
          Remind: You are creating a new note with current version.
        </Typography>
        <Typography variant="h8">
          On the left side, you can see the previos version and the difference.
          <br />
          On the right side, you can see your current version.
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
            setOpen(false);
          }}>
          OK!
        </Button>
      </Box>
    </Fragment>
  );
};

export default ModalContent;

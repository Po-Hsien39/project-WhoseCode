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
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useStatus } from '../../hook/useStatus';

const Version = () => {
  const { request, note, setVersionNote, versionNote } = useStatus();
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    const getVersions = async () => {
      if (!note || !note.id) return;
      const response = await request.getVersions(note.id);
      setVersions(response.data.diff);
    };
    getVersions();
  }, [note]);

  return (
    <Fragment>
      {versions.length ? (
        <Box>
          <Box sx={{ width: '100%', padding: '15px' }}>
            <Typography variant="h8">Versions</Typography>
          </Box>
          <Divider />
          {versions.map((version, i) => {
            return (
              <Fragment>
                <ButtonBase
                  key={i}
                  sx={{
                    width: '100%',
                    borderBottom:
                      versionNote.version === i + 1
                        ? 'none'
                        : '1px solid #E0E0E0',
                    background:
                      versionNote.version === i + 1 ? '#EBEBEB' : 'white',
                  }}
                  onClick={async () => {
                    let res = await request.getVersion(note.id, i + 1);
                    setVersionNote({
                      content: res.data.version,
                      id: note.id,
                      version: i + 1,
                    });
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
                    noWrap
                    sx={{
                      borderBottom: '1px solid #E0E0E0',
                      background: '#EBEBEB',
                      padding: '10px',
                    }}>
                    <Grid item xs={12} md={2}></Grid>
                    <Grid item xs={12} md={4}>
                      <Button variant="contained" color="tetiary">
                        Roll Back
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button variant="contained" color="tetiary">
                        View Diff
                      </Button>
                    </Grid>
                    {/* <Chip label={`View Diff`} color="primary" /> */}
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

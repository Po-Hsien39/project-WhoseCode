import Editor from '../components/Editor';
import DiffTemplate from '../components/Editor/templates/diff-template';
import DemoTemplate from '../components/Editor/templates/demo-template';
import { Fragment } from 'react';
import { useStatus } from '../hook/useStatus';
import Board from '../components/Board';
import { Grid, Box } from '@mui/material';

const EditorContainer = ({ createNote }) => {
  const { note, versionNote, diffVersion } = useStatus();

  return (
    <Box sx={{ height: '100%' }}>
      {diffVersion.compare ? (
        <Fragment>
          <Grid container sx={{ display: 'flex', width: '100%' }}>
            {diffVersion.showCurrent ? (
              <Fragment>
                <Grid item xs={12} md={5.75}>
                  <DiffTemplate versionNote={{ content: diffVersion.diff }} />
                </Grid>
                <Grid item xs={12} md={0.5}></Grid>
                <Grid item xs={12} md={5.75}>
                  <DemoTemplate versionNote={{ content: diffVersion.latest }} />
                </Grid>
              </Fragment>
            ) : (
              <Grid item xs={12} md={12}>
                <DiffTemplate versionNote={{ content: diffVersion.diff }} />
              </Grid>
            )}
          </Grid>
        </Fragment>
      ) : versionNote.id ? (
        <DemoTemplate versionNote={versionNote} />
      ) : note.url ? (
        <Editor noteId={note.id} url={note.url} />
      ) : (
        <Board createNote={createNote} />
      )}
    </Box>
  );
};

export default EditorContainer;

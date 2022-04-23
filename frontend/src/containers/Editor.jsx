import Editor from '../components/Editor';
import Template from '../components/Editor/template';
import { useEffect, Fragment } from 'react';
import { useStatus } from '../hook/useStatus';
import Board from '../components/Board';
import { Grid } from '@mui/material';

const EditorContainer = () => {
  const { note, versionNote, diffVersion } = useStatus();

  return (
    <Fragment>
      {diffVersion.compare ? (
        <Fragment>
          <Grid container sx={{ display: 'flex', width: '100%' }}>
            {diffVersion.showCurrent ? (
              <Fragment>
                <Grid item xs={12} md={5.75}>
                  <Template versionNote={{ content: diffVersion.diff }} />
                </Grid>
                <Grid item xs={12} md={0.5}></Grid>
                <Grid item xs={12} md={5.75}>
                  <Template versionNote={{ content: diffVersion.latest }} />
                </Grid>
              </Fragment>
            ) : (
              <Grid item xs={12} md={12}>
                <Template versionNote={{ content: diffVersion.diff }} />
              </Grid>
            )}
          </Grid>
        </Fragment>
      ) : versionNote.id ? (
        <Template versionNote={versionNote} />
      ) : note.id ? (
        <Editor noteId={note.id} />
      ) : (
        <Board />
      )}
    </Fragment>
  );
};

export default EditorContainer;

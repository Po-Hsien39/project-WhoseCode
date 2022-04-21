import Editor from '../components/Editor';
import Template from '../components/Editor/template';
import { useEffect, Fragment } from 'react';
import { useStatus } from '../hook/useStatus';
import Board from '../components/Board';

const EditorContainer = () => {
  const { note, versionNote } = useStatus();

  useEffect(() => {
    // console.log('EditorContainer');
    console.log(versionNote);
  }, [versionNote]);
  return (
    <Fragment>
      {versionNote.id ? (
        <Template versionNote={versionNote} />
      ) : note.id ? (
        <Editor noteId={note.id} />
      ) : (
        <Board />
      )}
    </Fragment>
    // <Fragment>
    //   <Editor raw={versionNote} />
    // </Fragment>
  );
};

export default EditorContainer;

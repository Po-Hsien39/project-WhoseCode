import Editor from '../components/Editor';
import { useEffect, Fragment } from 'react';
import { useStatus } from '../hook/useStatus';
import Board from '../components/Board';

const EditorContainer = () => {
  const { note } = useStatus();

  useEffect(() => {
    console.log('EditorContainer');
  }, []);
  return (
    <Fragment>{note.id ? <Editor noteId={note.id} /> : <Board />}</Fragment>
  );
};

export default EditorContainer;

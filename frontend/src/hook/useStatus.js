import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Request from './useRequest';
const StatusContext = createContext({
  user: {},
  setUser: () => {},
  note: {},
  setNote: () => {},
  request: {},
  notes: [],
  setNotes: () => {},
  versionNote: {},
  setVersionNote: () => {},
  editorState: null,
  setEditorState: () => {},
  diffVersion: {},
  setDiffVersion: () => {},
  createNoteDetails: {},
  setCreateNoteDetails: () => {},
  setDefaultCreate: () => {},
});

const defaultPermission = {
  title: '',
  star: false,
  permission: {
    openToPublic: true,
    allowEdit: false,
    allowComment: false,
    allowDuplicate: true,
  },
};

const StatusProvider = (props) => {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    login: false,
  });
  const [createNoteDetails, setCreateNoteDetails] = useState(defaultPermission);
  const setDefaultCreate = () => {
    setCreateNoteDetails(defaultPermission);
  };
  const [notes, setNotes] = useState({ private: [], collect: [], delete: [] });
  useEffect(() => {
    console.log(notes);
  }, [notes]);
  const [versionNote, setVersionNote] = useState({
    id: '',
    version: '',
    content: '',
  });
  const [diffVersion, setDiffVersion] = useState({
    compare: false,
    diff: null,
    latest: null,
    showCurrent: false,
  });
  const [note, setNote] = useState({
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
  const [request, setRequest] = useState(Request);
  const [socket, setSocket] = useState(null);
  const [editorState, setEditorState] = useState(null);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(socket);
  }, []);
  useEffect(() => {
    const getProfileData = async () => {
      const access_token = window.localStorage.getItem('token');
      if (!access_token) return;
      let res = await axios.get(
        process.env.REACT_APP_DOMAIN + '/api/1.0/user',
        { headers: { authorization: 'Bearer ' + access_token } }
      );
      const { data } = res.data;
      setUser({
        name: data.name,
        email: data.email,
        id: data.id,
        login: true,
      });
    };

    getProfileData();
  }, []);

  return (
    <StatusContext.Provider
      value={{
        user,
        setUser,
        socket,
        setSocket,
        note,
        setNote,
        request,
        notes,
        setNotes,
        versionNote,
        setVersionNote,
        editorState,
        setEditorState,
        diffVersion,
        setDiffVersion,
        createNoteDetails,
        setCreateNoteDetails,
        setDefaultCreate,
      }}
      {...props}
    />
  );
};

function useStatus() {
  return useContext(StatusContext);
}

export { StatusProvider, useStatus };

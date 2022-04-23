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
});

const StatusProvider = (props) => {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    login: false,
  });

  const [notes, setNotes] = useState({ private: [], collect: [], delete: [] });
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
  });
  const [request, setRequest] = useState(Request);
  const [socket, setSocket] = useState(null);
  const [editorState, setEditorState] = useState(null);

  useEffect(() => {
    console.log(versionNote);
  }, [versionNote]);

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
      }}
      {...props}
    />
  );
};

function useStatus() {
  return useContext(StatusContext);
}

export { StatusProvider, useStatus };

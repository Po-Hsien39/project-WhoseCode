import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Request from './useRequest';
import { useNavigate, useLocation } from 'react-router-dom';

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
  redirectUrl: '',
  setRedirectUrl: () => {},
  otherNotesPermission: {},
  setOtherNotesPermission: () => {},
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
  const navigate = useNavigate();
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
  const [redirectUrl, setRedirectUrl] = useState('');
  const [otherNotesPermission, setOtherNotesPermission] = useState({
    status: false,
    blocked: false,
    blockedType: '',
    othersPermission: {
      allowEdit: false,
      allowComment: false,
      allowDuplicate: false,
    },
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_APP_SOCKET_URL);
    setSocket(socket);
  }, []);

  const location = useLocation();
  useEffect(() => {
    const getProfileData = async () => {
      const access_token = window.localStorage.getItem('token');
      console.log(access_token);
      if (!access_token) {
        setRedirectUrl(location);
        if (location.pathname !== '/') {
          navigate('/login');
        }
        return;
      }
      let res = await axios.get(
        import.meta.env.VITE_APP_DOMAIN + '/api/1.0/user',
        {
          headers: { authorization: 'Bearer ' + access_token },
        }
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
        redirectUrl,
        setRedirectUrl,
        otherNotesPermission,
        setOtherNotesPermission,
      }}
      {...props}
    />
  );
};

function useStatus() {
  return useContext(StatusContext);
}

export { StatusProvider, useStatus };

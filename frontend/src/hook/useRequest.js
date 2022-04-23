import axios from 'axios';

const useRequest = {
  createNote: async (star) => {
    return await axios.post(
      process.env.REACT_APP_DOMAIN + '/api/1.0/note',
      { star },
      {
        headers: {
          authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
      }
    );
  },
  nativeSignIn: async (email, password) => {
    return await axios.post(
      process.env.REACT_APP_DOMAIN + '/api/1.0/user/signin',
      {
        email: email,
        password: password,
        provider: 'native',
      }
    );
  },
  signUp: async (name, email, password) => {
    return await axios.post(
      process.env.REACT_APP_DOMAIN + '/api/1.0/user/signup',
      {
        name: name,
        email: email,
        password: password,
        provider: 'native',
      }
    );
  },
  getAllNotes: async (userId) => {
    return await axios.get(
      process.env.REACT_APP_DOMAIN + '/api/1.0/notes/' + userId
    );
  },
  getNote: async (noteId) => {
    return await axios.get(
      process.env.REACT_APP_DOMAIN + '/api/1.0/note/' + noteId
    );
  },
  addStarToNote: async (noteId, star) => {
    return await axios.put(
      process.env.REACT_APP_DOMAIN + '/api/1.0/note/' + noteId,
      { star, type: 'star' }
    );
  },
  rollBackNote: async (noteId, version, content) => {
    console.log(noteId, version, content);
    return await axios.put(
      process.env.REACT_APP_DOMAIN + '/api/1.0/note/' + noteId,
      { type: 'rollback', version, content }
    );
  },
  getVersions: async (noteId) => {
    return await axios.get(
      process.env.REACT_APP_DOMAIN + '/api/1.0/versions/' + noteId
    );
  },
  getVersion: async (noteId, versionId) => {
    return await axios.get(
      process.env.REACT_APP_DOMAIN +
        '/api/1.0/version/' +
        noteId +
        '/' +
        versionId
    );
  },
};

export default useRequest;

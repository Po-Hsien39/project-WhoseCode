import axios from 'axios';

const useRequest = {
  createNote: async (note) => {
    return await axios.post(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note',
      { note },
      {
        headers: {
          authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
      }
    );
  },
  nativeSignIn: async (email, password) => {
    return await axios.post(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/user/signin',
      {
        email: email,
        password: password,
        provider: 'native',
      }
    );
  },
  signUp: async (name, email, password) => {
    return await axios.post(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/user/signup',
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
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/notes/' + userId
    );
  },
  getNote: async (noteUrl) => {
    return await axios.get(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteUrl,
      {
        headers: {
          authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
      }
    );
  },
  deleteNote: async (noteId, deletePermanent) => {
    return await axios.delete(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteId,
      {
        headers: {
          authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
        data: { deletePermanent },
      }
    );
  },
  createNoteContributor: async (noteId, contributor, permission) => {
    return await axios.put(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteId,
      { email: contributor, permission, type: 'createContributor' },
      {
        headers: {
          authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
      }
    );
  },

  updateNoteContributor: async (noteId, contributor, permission) => {
    console.log(noteId, contributor, permission);
    return await axios.put(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteId,
      { email: contributor, permission, type: 'editContributor' },
      {
        headers: {
          authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
      }
    );
  },

  deleteNoteContributor: async (noteId, contributor) => {
    return await axios.put(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteId,
      { email: contributor, type: 'deleteContributor' },
      {
        headers: {
          authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
      }
    );
  },

  restoreNote: async (noteId) => {
    return await axios.put(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteId,
      { type: 'restore' }
    );
  },
  addStarToNote: async (noteId, star) => {
    return await axios.put(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteId,
      { star, type: 'star' }
    );
  },
  rollBackNote: async (noteId, version, content) => {
    console.log(noteId, version, content);
    return await axios.put(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteId,
      { type: 'rollback', version, content }
    );
  },
  getPermission: async (noteId) => {
    return await axios.get(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/permission/' + noteId,
      {
        headers: {
          authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
      }
    );
  },
  alterPublicPermission: async (noteId, permissionChange) => {
    return await axios.put(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteId,
      {
        type: 'permission',
        permission: { ...permissionChange, type: 'alterPublicPermission' },
      }
    );
  },
  allowPublicPermission: async (noteId) => {
    return await axios.put(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteId,
      {
        type: 'permission',
        permission: { type: 'allowPublic' },
      }
    );
  },
  denyPublicPermission: async (noteId) => {
    return await axios.put(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/note/' + noteId,
      {
        type: 'permission',
        permission: { type: 'denyPublic' },
      }
    );
  },
  getVersions: async (noteId) => {
    return await axios.get(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/versions/' + noteId
    );
  },
  getVersion: async (noteId, versionId) => {
    return await axios.get(
      import.meta.env.VITE_APP_DOMAIN +
        '/api/1.0/version/' +
        noteId +
        '/' +
        versionId
    );
  },
  createComment: async (noteId, comment) => {
    return await axios.post(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/comment/' + noteId,
      { comment },
      {
        headers: {
          authorization: 'Bearer ' + window.localStorage.getItem('token'),
        },
      }
    );
  },
  getComments: async (noteId) => {
    return await axios.get(
      import.meta.env.VITE_APP_DOMAIN + '/api/1.0/comments/' + noteId
    );
  },
};

export default useRequest;

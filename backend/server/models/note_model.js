const pool = require('../../util/mysqlcon');
const { Note } = require('../../util/schema');
const { v1: uuidv1 } = require('uuid');

const getNote = async (noteUrl, requireUser) => {
  let [[res]] = await pool.query(
    'SELECT id, user_id, title, star FROM notes WHERE url = ?',
    [noteUrl]
  );
  if (!res) return { error: 'NOT_FOUND' };
  const { id: noteId, user_id, title, star } = res;
  // The note belongs to the requester
  if (requireUser === user_id) {
    const { latest } = await Note.findById(noteId);
    return { latest, title, noteId, star };
  } else {
    let { permission, latest } = await Note.findById(noteId);
    if (!permission.openToPublic) {
      return { error: 'PERMISSION_DENIED' };
    }
    permission.owner = false;
    return { latest, title, noteId, star, permission };
  }
};

const getAllNotes = async (user_id) => {
  let [notes] = await pool.query('SELECT * FROM notes WHERE user_id = ?', [
    user_id,
  ]);
  console.log(notes);
  for (let i = 0; i < notes.length; i++) {
    let { createdAt, updatedAt } = await Note.findById(notes[i].id);
    notes[i].createdAt = createdAt;
    notes[i].updatedAt = updatedAt;
  }
  return notes;
};

const createNote = async (user_id, note) => {
  //FIXME: Adding transaction here
  const { title, star, permission } = note;
  const url = uuidv1();
  let [{ insertId: noteId }] = await pool.query(
    'INSERT INTO notes (user_id, title, star, url) VALUES (?, ?, ?, ?)',
    [user_id, title, star, url]
  );
  await Note.create({
    _id: noteId,
    permission: { ...permission, allowOthers: [] },
  });
  return { url, noteId, star, title };
};

const modifyNote = async (noteId, star) => {
  await pool.query('UPDATE notes SET star = ? WHERE id = ?', [star, noteId]);
};

const rollBackNote = async (noteId, versionId, content) => {
  let { diff } = await Note.findById(noteId);
  diff = diff.slice(0, versionId);

  await Note.findByIdAndUpdate(noteId, {
    diff,
    latest: content,
    version: content,
  });
};

const alterPermission = async (noteId, permission) => {
  const requestType = permission.type;
  if (requestType === 'alterPublicPermission') {
    if (
      !['allowEdit', 'allowComment', 'allowDuplicate'].includes(
        permission.target
      )
    ) {
      let err = new Error('Invalid permission type');
      err.status = 400;
      throw err;
    }
    if (permission.target === 'allowEdit') {
      await Note.findByIdAndUpdate(noteId, {
        $set: { 'permission.allowEdit': permission.value },
      });
    } else if (permission.target === 'allowComment') {
      await Note.findByIdAndUpdate(noteId, {
        $set: { 'permission.allowComment': permission.value },
      });
    } else if (permission.target === 'allowDuplicate') {
      await Note.findByIdAndUpdate(noteId, {
        $set: { 'permission.allowDuplicate': permission.value },
      });
    }
  } else if (requestType === 'allowPublic') {
    await Note.findByIdAndUpdate(noteId, {
      // $set: { 'permission.openToPublic': true },
      $set: {
        'permission.allowDuplicate': true,
        'permission.openToPublic': true,
      },
    });
  } else if (requestType === 'denyPublic') {
    await Note.findByIdAndUpdate(noteId, {
      $set: {
        'permission.openToPublic': false,
        'permission.allowEdit': false,
        'permission.allowComment': false,
        'permission.allowDuplicate': false,
      },
    });
  }
};

const deleteNote = async (id) => {
  await pool.query('DELETE FROM notes WHERE id = ?', [id]);
};

module.exports = {
  createNote,
  getAllNotes,
  getNote,
  deleteNote,
  modifyNote,
  rollBackNote,
  alterPermission,
};

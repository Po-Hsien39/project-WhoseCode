const pool = require('../../util/mysqlcon');
const { Note } = require('../../util/schema');
const { v1: uuidv1 } = require('uuid');

const getNote = async (noteUrl, requireUser) => {
  let [[res]] = await pool.query(
    `SELECT a.id, a.title, a.star, b.userId, b.permission FROM notes as a, permission as b 
  WHERE a.id = b.noteId and a.url = ? and b.userId = ?`,
    [noteUrl, requireUser]
  );
  // If the user is not in the note's permission list
  if (!res) {
    const [[response]] = await pool.query(
      `SELECT id, title, deleted FROM notes WHERE url = ?`,
      [noteUrl]
    );
    if (!response || response.deleted) return { error: 'NOT_FOUND' };
    const { id: noteId, title } = response;
    let { permission, latest } = await Note.findById(noteId);
    if (!permission.openToPublic) {
      return { error: 'PERMISSION_DENIED' };
    }
    permission.owner = false;
    return { latest, title, noteId, permission };
  }

  const { id: noteId, title, star, permission } = res;
  // The note belongs to the requester
  if (permission === 1) {
    const { latest } = await Note.findById(noteId);
    return { latest, title, noteId, star };
  } else if (permission) {
    const { latest } = await Note.findById(noteId);
    return {
      latest,
      title,
      noteId,
      star,
      permission: {
        owner: false,
        openToPublic: true,
        allowEdit: permission <= 2,
        allowComment: permission <= 3,
        allowDuplicate: permission <= 4,
      },
    };
  }
};

//TODO: This part should be modified to new schema
const getAllNotes = async (user_id) => {
  let [notes] = await pool.query(
    'select notes.*, permission.permission from notes, permission where notes.id = permission.noteId and permission.userId = ?',
    [user_id]
  );

  for (let i = 0; i < notes.length; i++) {
    let { createdAt, updatedAt, permission } = await Note.findById(notes[i].id);
    notes[i].createdAt = createdAt;
    notes[i].updatedAt = updatedAt;
    notes[i].permission = permission.allowOthers.map((e) => e.email);
  }
  return notes;
};

//TODO: This part should be modified to new schema
const createNote = async (user_id, note) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const { title, star, permission, content } = note;
    const url = uuidv1();
    let [{ insertId: noteId }] = await conn.query(
      'INSERT INTO notes (title, star, url) VALUES (?, ?, ?)',
      [title, star, url]
    );
    await conn.query(
      'INSERT INTO permission (userId, noteId, permission) VALUES (?, ?, ?)',
      [user_id, noteId, 1]
    );
    await Note.create({
      _id: noteId,
      permission: { ...permission, allowOthers: [] },
      latest: content ? content : '',
    });

    await conn.query('COMMIT');
    return { url, noteId, star, title, permission };
  } catch (error) {
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    await conn.release();
  }
};

const createContributor = async (noteId, email, permission) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const [[res]] = await conn.query('SELECT id FROM user WHERE email = ?', [
      email,
    ]);
    if (!res) {
      await conn.query('COMMIT');
      return { error: 'USER_NOT_FOUND' };
    }
    const id = res.id;
    let pId = 0;
    if (permission === 'edit') pId = 2;
    else if (permission === 'comment') pId = 3;
    else if (permission === 'view') pId = 4;
    await conn.query(
      'INSERT INTO permission (userId, noteId, permission) VALUES (?, ?, ?)',
      [id, noteId, pId]
    );
    await Note.findByIdAndUpdate(noteId, {
      $push: {
        'permission.allowOthers': {
          email,
          permission,
        },
      },
    });

    await conn.query('COMMIT');
  } catch (error) {
    console.log(error);
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    await conn.release();
  }
};

const updateContributor = async (noteId, email, permission) => {
  let pId;
  if (permission === 'edit') pId = 2;
  else if (permission === 'comment') pId = 3;
  else if (permission === 'view') pId = 4;
  await pool.query(
    'UPDATE permission SET permission = ? WHERE noteId = ? and userId = (SELECT id FROM user WHERE email = ?)',
    [pId, noteId, email]
  );
  await Note.updateOne(
    { _id: noteId, 'permission.allowOthers.email': email },
    {
      $set: {
        'permission.allowOthers.$.permission': permission,
      },
    }
  );
};

const deleteContributor = async (noteId, email) => {
  console.log('????????????');
  console.log(noteId, email);
  await pool.query(
    'DELETE FROM permission WHERE noteId = ? and userId = (SELECT id FROM user WHERE email = ?)',
    [noteId, email]
  );
  await Note.updateOne(
    { _id: noteId },
    {
      $pull: {
        'permission.allowOthers': {
          email,
        },
      },
    }
  );
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

const restoreNote = async (id) => {
  await pool.query('UPDATE notes SET deleted = 0 WHERE id = ?', [id]);
};

const deleteNote = async (id, deletePermanent) => {
  console.log(deletePermanent);
  if (!deletePermanent)
    await pool.query('UPDATE notes SET deleted = 1, star = 0 WHERE id = ?', [
      id,
    ]);
  else {
    await pool.query('DELETE FROM permission WHERE noteId = ?', [id]);
    await pool.query('DELETE FROM notes WHERE id = ?', [id]);
    await Note.findByIdAndDelete(id);
  }
};

module.exports = {
  createNote,
  getAllNotes,
  getNote,
  deleteNote,
  modifyNote,
  rollBackNote,
  alterPermission,
  restoreNote,
  createContributor,
  updateContributor,
  deleteContributor,
};

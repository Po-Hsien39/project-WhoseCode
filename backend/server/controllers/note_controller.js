const Note = require('../models/note_model');

const getAllNotes = async (req, res) => {
  const { id: userId } = req.params;
  if (!userId) res.status(400).send('userId is required');
  const notes = await Note.getAllNotes(userId);
  console.log(notes);
  res.send({ status: 'success', notes });
};

const getNote = async (req, res) => {
  const { id: noteUrl } = req.params;
  if (!noteUrl) return res.status(400).send('noteUrl is required');
  const { latest, title, noteId, star, error, permission } = await Note.getNote(
    noteUrl,
    req.user.id
  );
  console.log(error);
  if (error === 'NOT_FOUND')
    return res.status(404).send({ status: 'NOT_FOUND', error });
  else if (error === 'PERMISSION_DENIED')
    return res
      .status(401)
      .send({ status: 'fail', message: 'Permission Denied' });
  res.json({ status: 'success', noteId, latest, title, star, permission });
};

const createNote = async (req, res) => {
  const { id } = req.user;
  const { note } = req.body;
  if (!id) res.status(400).send('userId is required');
  const { noteId, url, star, title, error } = await Note.createNote(id, note);
  if (error) return res.status(500).send({ status: 'Internal server error' });
  res.send({ status: 'success', noteId, url, star, title });
};

const modifyNote = async (req, res) => {
  const { type, star, version, content, permission } = req.body;
  const { id: noteId } = req.params;
  if (!noteId) return res.status(400).send('noteId is required');
  if (!type) return res.status(400).send('type is required');

  if (type === 'star') {
    await Note.modifyNote(noteId, star);
  } else if (type === 'rollback') {
    await Note.rollBackNote(noteId, version, content);
  } else if (type === 'permission') {
    await Note.alterPermission(noteId, permission);
  } else if (type === 'restore') {
    await Note.restoreNote(noteId);
  }
  res.send({ status: 'success' });
};

const deleteNote = async (req, res) => {
  const { id: noteId } = req.params;
  const { deletePermanent } = req.body;
  await Note.deleteNote(noteId, deletePermanent);
  res.send({ status: 'success' });
};

module.exports = { getAllNotes, getNote, createNote, modifyNote, deleteNote };

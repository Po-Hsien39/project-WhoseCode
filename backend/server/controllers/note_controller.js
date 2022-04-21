const Note = require('../models/note_model');

const getAllNotes = async (req, res) => {
  const { id: userId } = req.params;
  if (!userId) res.status(400).send('userId is required');
  const notes = await Note.getAllNotes(userId);
  console.log(notes);
  res.send({ status: 'success', notes });
};

const getNote = async (req, res) => {
  const { id: noteId } = req.params;
  if (!noteId) res.status(400).send('noteId is required');
  const note = await Note.getNote(noteId);
  res.json({ status: 'success', note: note.latest });
};

const createNote = async (req, res) => {
  const { id } = req.user;
  const { star } = req.body;
  if (!id) res.status(400).send('userId is required');
  const noteId = await Note.createNote(id, star || false);
  res.send({ status: 'success', noteId });
};

const modifyNote = async (req, res) => {
  const { star } = req.body;
  const { id: noteId } = req.params;
  if (!noteId) return res.status(400).send('noteId is required');
  await Note.modifyNote(noteId, star);
  res.send({ status: 'success' });
};

const deleteNote = async (req, res) => {
  const { id: noteId } = req.body;
  await Note.deleteNote(noteId);
  res.send({ status: 'success' });
};

module.exports = { getAllNotes, getNote, createNote, modifyNote, deleteNote };

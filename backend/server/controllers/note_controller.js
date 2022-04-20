const Note = require('../models/note_model');

const getAllNotes = async (req, res) => {
  const { id: userId } = req.params;
  const notes = await Note.getAllNotes(userId);
  res.send({ status: 'success', notes });
};

const getNote = async (req, res) => {
  const { id: noteId } = req.params;
  const note = await Note.getNote(noteId);
  res.json({ status: 'success', note });
};

const createNote = async (req, res) => {
  const { id } = req.user;
  const { star } = req.body;
  const noteId = await Note.createNote(id, star || false);
  res.send({ status: 'success', noteId });
};

const modifyNote = (req, res) => {};
const deleteNote = (req, res) => {
  const { id: noteId } = req.body;
  Note.deleteNote(noteId);
  res.send({ status: 'success' });
};

module.exports = { getAllNotes, getNote, createNote, modifyNote, deleteNote };

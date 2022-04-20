const pool = require('../../util/mysqlcon');
const { Note } = require('../../util/schema');

const getNote = async (noteId) => {
  let note = await Note.findOne({ noteId });
  console.log(note);
  return note;
};

const getAllNotes = async (user_id) => {
  let [notes] = await pool.query('SELECT * FROM notes WHERE user_id = ?', [
    user_id,
  ]);
  return notes;
};

const createNote = async (user_id, star) => {
  let [{ insertId }] = await pool.query(
    'INSERT INTO notes (user_id, star) VALUES (?, ?)',
    [user_id, star]
  );
  return insertId;
};

const deleteNote = async (id) => {
  await pool.query('DELETE FROM notes WHERE id = ?', [id]);
};

module.exports = { createNote, getAllNotes, getNote, deleteNote };
